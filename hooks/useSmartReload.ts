// hooks/useSmartReload.ts
import { useCallback, useEffect } from 'react';
import { useFocusEffect } from '@react-navigation/native';
import { AppState, AppStateStatus } from 'react-native';
import { eventBus } from '@/contexts/EventBus';

/**
 * Smart reload hook that keeps data updated automatically.
 *
 * @param dataType - A string representing the data category (e.g., "transactions", "books").
 * @param reloadFn - Function to reload data from storage.
 * @param deps - Optional dependencies (e.g., [currentMonth]).
 */
export function useSmartReload(
    dataType: string,
    reloadFn: () => void,
    deps: any[] = []
) {
    // 1️⃣ Reload whenever the screen comes into focus
    useFocusEffect(
        useCallback(() => {
            reloadFn();
        }, deps)
    );

    // 2️⃣ Reload when a global event is fired (real-time updates)
    useEffect(() => {
        const unsubscribe = eventBus.onUpdate(dataType, reloadFn);
        return () => {
            // ✅ Proper cleanup function
            unsubscribe();
        };
    }, [reloadFn, dataType]);

    // 3️⃣ Reload when app comes back to foreground
    useEffect(() => {
        const handleAppStateChange = (state: AppStateStatus) => {
            if (state === 'active') {
                reloadFn();
            }
        };

        const subscription = AppState.addEventListener('change', handleAppStateChange);
        return () => {
            subscription.remove();
        };
    }, [reloadFn]);
}
