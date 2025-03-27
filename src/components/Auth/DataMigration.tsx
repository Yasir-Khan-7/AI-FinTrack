import React, { useEffect, useState } from 'react';
import { Alert, Box, Button, CircularProgress, Dialog, DialogActions, DialogContent, DialogTitle, Typography } from '@mui/material';
import { useAuth } from '../../context/AuthContext';
import { migrateLocalStorageToSupabase, migrateChatHistoryToSupabase } from '../../utils/migrateData';

interface MigrationState {
    showMigration: boolean;
    migrationInProgress: boolean;
    migrationComplete: boolean;
    transactionsMigrated: number;
    chatMessagesMigrated: number;
    error: string | null;
}

const DataMigration: React.FC = () => {
    const { user } = useAuth();
    const [state, setState] = useState<MigrationState>({
        showMigration: false,
        migrationInProgress: false,
        migrationComplete: false,
        transactionsMigrated: 0,
        chatMessagesMigrated: 0,
        error: null
    });

    useEffect(() => {
        // Check if migration is needed
        const checkMigrationNeeded = () => {
            const hasLocalTransactions = localStorage.getItem('transactions') !== null;
            const hasLocalChatHistory = localStorage.getItem('chatHistory') !== null;
            const hasMigrated = localStorage.getItem('dataMigrated') === 'true';

            return (hasLocalTransactions || hasLocalChatHistory) && !hasMigrated;
        };

        // Only show migration dialog if user is logged in and migration is needed
        if (user && checkMigrationNeeded()) {
            setState(prev => ({ ...prev, showMigration: true }));
        }
    }, [user]);

    const handleMigrateData = async () => {
        if (!user) return;

        setState(prev => ({ ...prev, migrationInProgress: true, error: null }));

        try {
            // Migrate transactions
            const transactionsMigration = await migrateLocalStorageToSupabase();

            // Migrate chat history
            const chatMigration = await migrateChatHistoryToSupabase();

            // Mark migration as complete
            localStorage.setItem('dataMigrated', 'true');

            setState(prev => ({
                ...prev,
                migrationInProgress: false,
                migrationComplete: true,
                transactionsMigrated: transactionsMigration.success ? transactionsMigration.migratedCount : 0,
                chatMessagesMigrated: chatMigration.success ? chatMigration.migratedCount : 0,
                error: transactionsMigration.error || chatMigration.error || null
            }));
        } catch (error: any) {
            setState(prev => ({
                ...prev,
                migrationInProgress: false,
                error: error.message || 'An unexpected error occurred during data migration'
            }));
        }
    };

    const handleClose = () => {
        setState(prev => ({ ...prev, showMigration: false }));
    };

    if (!state.showMigration) {
        return null;
    }

    return (
        <Dialog
            open={state.showMigration}
            onClose={state.migrationInProgress ? undefined : handleClose}
            aria-labelledby="migration-dialog-title"
            maxWidth="sm"
            fullWidth
        >
            <DialogTitle id="migration-dialog-title">
                Data Migration
            </DialogTitle>
            <DialogContent>
                {!state.migrationComplete ? (
                    <>
                        <Typography variant="body1" gutterBottom>
                            We've detected existing data stored in your browser's local storage. Would you like to migrate it to your account?
                        </Typography>
                        <Typography variant="body2" color="text.secondary" sx={{ mt: 1 }}>
                            This will securely transfer your financial data to our servers, allowing you to access it across devices.
                        </Typography>
                    </>
                ) : (
                    <>
                        <Typography variant="body1" gutterBottom>
                            Data migration completed successfully!
                        </Typography>
                        <Box sx={{ mt: 2, mb: 2 }}>
                            <Typography variant="body2">
                                • {state.transactionsMigrated} transactions migrated
                            </Typography>
                            <Typography variant="body2">
                                • {state.chatMessagesMigrated} chat messages migrated
                            </Typography>
                        </Box>
                    </>
                )}

                {state.error && (
                    <Alert severity="error" sx={{ mt: 2 }}>
                        {state.error}
                    </Alert>
                )}

                {state.migrationInProgress && (
                    <Box sx={{ display: 'flex', alignItems: 'center', mt: 2 }}>
                        <CircularProgress size={24} sx={{ mr: 2 }} />
                        <Typography>Migrating your data...</Typography>
                    </Box>
                )}
            </DialogContent>
            <DialogActions>
                {!state.migrationComplete ? (
                    <>
                        <Button
                            onClick={handleClose}
                            disabled={state.migrationInProgress}
                        >
                            Skip
                        </Button>
                        <Button
                            onClick={handleMigrateData}
                            variant="contained"
                            color="primary"
                            disabled={state.migrationInProgress}
                        >
                            Migrate Data
                        </Button>
                    </>
                ) : (
                    <Button onClick={handleClose} variant="contained" color="primary">
                        Continue
                    </Button>
                )}
            </DialogActions>
        </Dialog>
    );
};

export default DataMigration; 