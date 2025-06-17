#!/bin/bash

# Update file content systematically
sed -i 's/Dialog Management Composable/Authentication Dialog Management Composable/' src/composables/useAuthDialogManager.ts
sed -i 's/centralized dialog state management for the application/centralized dialog state management for authentication and application-level dialogs/' src/composables/useAuthDialogManager.ts
sed -i 's/consolidates multiple dialog refs/consolidates authentication flow dialogs and app-level system dialogs/' src/composables/useAuthDialogManager.ts
sed -i 's/provides a clean API for dialog operations/provides a clean API for auth dialog operations/' src/composables/useAuthDialogManager.ts
sed -i 's/Centralized dialog state management/Centralized authentication dialog state management/' src/composables/useAuthDialogManager.ts
sed -i 's/Type-safe dialog names/Type-safe auth dialog names/' src/composables/useAuthDialogManager.ts
sed -i 's/useDialogManager()/useAuthDialogManager()/' src/composables/useAuthDialogManager.ts
sed -i 's/Open a specific dialog/Open a specific authentication dialog/' src/composables/useAuthDialogManager.ts
sed -i 's/Check if any dialog is open/Check if any auth dialog is open/' src/composables/useAuthDialogManager.ts
sed -i 's/Available dialog types/Available authentication dialog types/' src/composables/useAuthDialogManager.ts
sed -i 's/export type DialogType/export type AuthDialogType/' src/composables/useAuthDialogManager.ts
sed -i 's/: DialogType/: AuthDialogType/g' src/composables/useAuthDialogManager.ts
sed -i 's/<DialogType/<AuthDialogType/g' src/composables/useAuthDialogManager.ts
sed -i 's/DialogType>/AuthDialogType>/g' src/composables/useAuthDialogManager.ts
sed -i 's/DialogType\[\]/AuthDialogType[]/g' src/composables/useAuthDialogManager.ts
sed -i 's/DialogType |/AuthDialogType |/' src/composables/useAuthDialogManager.ts
sed -i 's/DialogType,/AuthDialogType,/g' src/composables/useAuthDialogManager.ts
sed -i 's/as DialogType/as AuthDialogType/g' src/composables/useAuthDialogManager.ts
sed -i 's/interface DialogManagerOptions/interface AuthDialogManagerOptions/' src/composables/useAuthDialogManager.ts
sed -i 's/DialogManagerOptions/AuthDialogManagerOptions/g' src/composables/useAuthDialogManager.ts
sed -i 's/function useDialogManager/function useAuthDialogManager/' src/composables/useAuthDialogManager.ts
sed -i 's/export default useDialogManager/export default useAuthDialogManager/' src/composables/useAuthDialogManager.ts
sed -i 's/Default options for dialog manager/Default options for authentication dialog manager/' src/composables/useAuthDialogManager.ts
sed -i "s/'dialog-state'/'auth-dialog-state'/" src/composables/useAuthDialogManager.ts
sed -i 's/Dialog management composable/Authentication dialog management composable/' src/composables/useAuthDialogManager.ts
sed -i 's/Provides centralized dialog state management for the application/Provides centralized dialog state management for authentication and app-level dialogs/' src/composables/useAuthDialogManager.ts

echo "File updated successfully"
