import { PERSONAL_CATEGORIES, RURAL_CATEGORIES } from './categoryStructure';
import { logError } from './errorLogger';

export const createDefaultUserData = async (userId, supabase, planType = 'PESSOAL', userData = null) => {
  if (!userId || !supabase) {
    console.error('[createDefaultUserData] Missing userId or supabase client');
    return { success: false };
  }

  const results = { categories: false, wallet: false, creditCard: false, profileUpdated: false };

  // Set absolute timeout for the entire process (15 seconds to ensure fast completion)
  const controller = new AbortController();
  const timeoutId = setTimeout(() => {
    console.warn(`[createDefaultUserData] Process timed out for user ${userId}`);
    controller.abort();
  }, 15000);

  try {
    console.log(`[createDefaultUserData] START - User: ${userId} | Plan: ${planType}`);

    if (userData) {
      console.log(`[createDefaultUserData] Updating profile data for user ${userId}...`);
      try {
        const updates = {};
        if (userData.phone) updates.phone = userData.phone;
        if (userData.name) updates.name = userData.name;
        if (userData.cpf) updates.cpf = userData.cpf;
        
        if (Object.keys(updates).length > 0) {
            const { error: profileError } = await supabase.from('profiles').update(updates).eq('id', userId);
            if (profileError) {
              logError('[createDefaultUserData] Failed to update profile data', profileError, userId);
            } else {
              console.log(`[createDefaultUserData] Profile updated successfully.`);
              results.profileUpdated = true;
            }
        }
      } catch (err) {
        logError("[createDefaultUserData] Error updating profile", err, userId);
      }
    }

    if (controller.signal.aborted) throw new Error("Operation timed out before categories");

    let categoriesToCreate = [...PERSONAL_CATEGORIES];
    if (planType && planType.toUpperCase().includes('RURAL')) {
      categoriesToCreate = [...categoriesToCreate, ...RURAL_CATEGORIES];
    }

    try {
      console.log(`[createDefaultUserData] Fetching existing categories...`);
      const { data: existingCategories, error: catFetchErr } = await supabase
        .from('categories')
        .select('name, type')
        .eq('user_id', userId);

      if (catFetchErr) throw catFetchErr;

      const existingSet = new Set(existingCategories?.map(c => `${c.name}-${c.type}`));
      console.log(`[createDefaultUserData] Found ${existingSet.size} existing categories. Starting inserts...`);

      for (const category of categoriesToCreate) {
        if (controller.signal.aborted) {
          console.warn("[createDefaultUserData] Aborting category creation due to timeout");
          break;
        }
        if (existingSet.has(`${category.name}-${category.type}`)) continue;

        console.log(`[createDefaultUserData] Inserting parent category: ${category.name}`);
        const { data: parentData, error: parentError } = await supabase
          .from('categories')
          .insert({
            user_id: userId, name: category.name, type: category.type,
            status: 'active', color: category.color, icon: category.icon
          })
          .select('id')
          .single();

        if (parentError) {
          logError(`[createDefaultUserData] Failed to create parent category ${category.name}`, parentError, userId);
          continue;
        }

        if (category.subcategories && category.subcategories.length > 0) {
          console.log(`[createDefaultUserData] Inserting ${category.subcategories.length} subcategories for ${category.name}`);
          const subcategoriesPayload = category.subcategories.map(sub => ({
            user_id: userId, name: sub.name, type: sub.type, status: 'active',
            parent_id: parentData.id, color: sub.color, icon: sub.icon
          }));

          const { error: childrenError } = await supabase.from('categories').insert(subcategoriesPayload);
          if (childrenError) {
            logError(`[createDefaultUserData] Failed to create subcategories for ${category.name}`, childrenError, userId);
          }
        }
      }
      console.log(`[createDefaultUserData] Categories creation completed.`);
      results.categories = true;
    } catch (catErr) {
      logError("[createDefaultUserData] Error in category creation block", catErr, userId);
    }

    if (controller.signal.aborted) throw new Error("Operation timed out before wallets");

    try {
      console.log(`[createDefaultUserData] Fetching existing wallets...`);
      const { data: existingWallets, error: walletFetchErr } = await supabase
          .from('wallets')
          .select('name')
          .eq('user_id', userId);
      
      if (walletFetchErr) throw walletFetchErr;
      
      const walletNames = new Set(existingWallets?.map(w => w.name));
      const promises = [];

      if (!walletNames.has("Banco")) {
          console.log(`[createDefaultUserData] Queuing insert for 'Banco' wallet`);
          promises.push(supabase.from('wallets').insert({
              user_id: userId, name: "Banco", type: "bank", balance: 0, color: "#10b981"
          }));
      }

      if (!walletNames.has("Cartão de Crédito")) {
          console.log(`[createDefaultUserData] Queuing insert for 'Cartão de Crédito' wallet`);
          promises.push(supabase.from('wallets').insert({
              user_id: userId, name: "Cartão de Crédito", type: "credit", balance: 0,
              closing_day: 10, due_day: 15, color: "#6366f1"
          }));
      }

      if (promises.length > 0) {
        console.log(`[createDefaultUserData] Executing wallet inserts...`);
        const executionResults = await Promise.allSettled(promises);
        if (executionResults.every(r => r.status === 'fulfilled')) {
            console.log(`[createDefaultUserData] Wallets created successfully.`);
            results.wallet = true;
            results.creditCard = true;
        } else {
            logError("[createDefaultUserData] Some wallet creations failed", new Error("Promise.allSettled failed"), userId, executionResults);
        }
      } else {
        console.log(`[createDefaultUserData] Wallets already exist, skipping.`);
      }
    } catch (wallErr) {
      logError("[createDefaultUserData] Error in wallet creation", wallErr, userId);
    }

    console.log(`[createDefaultUserData] END - Process finished successfully.`);
    return results;

  } catch (error) {
    logError('[createDefaultUserData] Unexpected error in createDefaultUserData', error, userId);
    return results;
  } finally {
    clearTimeout(timeoutId);
  }
};