import { supabase } from '@/lib/customSupabaseClient';
import { fetchWithRetry } from '@/utils/supabaseQueryHelper';

/**
 * Checks and generates monthly payables from active recurring expenses.
 * It checks the current month (as catch-up) and the next month (if today is the last day of the month).
 * 
 * @param {Object} user - Logged-in user object
 * @param {Function} toast - Toast notification function
 * @param {Function} onGenerateComplete - Callback to reload data in the UI
 */
export const checkAndGenerateRecurringExpenses = async (user, toast, onGenerateComplete) => {
  if (!user?.id) return;

  try {
    // 1. Fetch active recurring expenses for the user
    const { data: expenses, error: fetchError } = await fetchWithRetry(
      () => supabase
        .from('recurring_expenses')
        .select('*')
        .eq('user_id', user.id)
        .eq('status', 'active'),
      { maxRetries: 3, timeoutMs: 10000, context: { functionName: 'checkAndGenerateRecurringExpenses_fetch' } }
    );

    if (fetchError) {
      console.error('Failed to fetch recurring expenses for schedule check:', fetchError);
      return;
    }

    if (!expenses || expenses.length === 0) {
      return;
    }

    // 2. Determine target months to verify
    const today = new Date();
    const currentYear = today.getFullYear();
    const currentMonth = today.getMonth(); // 0-indexed (0 = Jan, 11 = Dec)

    // Check if today is the last day of the month
    const tomorrow = new Date(currentYear, currentMonth, today.getDate() + 1);
    const isLastDay = tomorrow.getDate() === 1;

    const targets = [
      { year: currentYear, month: currentMonth }
    ];

    if (isLastDay) {
      const nextMonth = currentMonth === 11 ? 0 : currentMonth + 1;
      const nextYear = currentMonth === 11 ? currentYear + 1 : currentYear;
      targets.push({ year: nextYear, month: nextMonth });
    }

    let generatedCount = 0;

    // 3. For each active recurring expense, check if payable exists for target month(s)
    for (const expense of expenses) {
      const startDateStr = expense.start_date;
      if (!startDateStr) continue;

      const startDate = new Date(startDateStr + 'T00:00:00');
      const startYear = startDate.getFullYear();
      const startMonth = startDate.getMonth();

      for (const target of targets) {
        // Skip if target month/year is before the expense start month/year
        if (target.year < startYear || (target.year === startYear && target.month < startMonth)) {
          continue;
        }

        // Calculate boundary dates for target month
        const startOfMonth = `${target.year}-${String(target.month + 1).padStart(2, '0')}-01`;
        const lastDay = new Date(target.year, target.month + 1, 0).getDate();
        const endOfMonth = `${target.year}-${String(target.month + 1).padStart(2, '0')}-${String(lastDay).padStart(2, '0')}`;

        // Check if payable already exists for this recurring expense in this month
        const { data: existing, error: queryError } = await fetchWithRetry(
          () => supabase
            .from('payables_receivables')
            .select('id')
            .eq('recurring_id', expense.id)
            .gte('due_date', startOfMonth)
            .lte('due_date', endOfMonth)
            .limit(1),
          { maxRetries: 2, timeoutMs: 5000, context: { functionName: 'checkAndGenerateRecurringExpenses_queryExisting' } }
        );

        if (queryError) {
          console.error(`Error checking existing payable for expense ${expense.id} in target month:`, queryError);
          continue;
        }

        // If not generated, create the payable
        if (!existing || existing.length === 0) {
          let validDueDay = expense.due_day;
          if (validDueDay > lastDay) {
            validDueDay = lastDay;
          }
          const dueDateString = `${target.year}-${String(target.month + 1).padStart(2, '0')}-${String(validDueDay).padStart(2, '0')}`;

          const newPayable = {
            user_id: user.id,
            type: 'payable',
            description: expense.name,
            amount: parseFloat(expense.amount),
            due_date: dueDateString,
            wallet_id: expense.wallet_id,
            category_id: expense.category_id,
            status: 'pending',
            recurring_id: expense.id,
            paid_amount: 0
          };

          const { error: insertError } = await supabase
            .from('payables_receivables')
            .insert(newPayable);

          if (insertError) {
            console.error(`Error generating payable for recurring expense ${expense.id}:`, insertError);
            continue;
          }

          // Update last_generated_at on recurring_expenses table
          await supabase
            .from('recurring_expenses')
            .update({ last_generated_at: new Date().toISOString() })
            .eq('id', expense.id);

          generatedCount++;
        }
      }
    }

    // 4. Trigger UI callback and show toast if any payables were generated
    if (generatedCount > 0) {
      if (onGenerateComplete) {
        onGenerateComplete();
      }
      
      toast({
        title: "Contas Recorrentes Geradas",
        description: `${generatedCount} ${generatedCount === 1 ? 'nova conta' : 'novas contas'} a pagar de despesas recorrentes ${generatedCount === 1 ? 'foi criada' : 'foram criadas'} automaticamente.`,
      });
    }
  } catch (error) {
    console.error('Unexpected error in recurring expenses scheduler:', error);
  }
};
