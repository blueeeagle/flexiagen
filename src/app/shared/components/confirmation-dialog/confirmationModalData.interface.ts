export interface confirmationDialogData
{
    title?: string;
    message?: string;
    type?: | 'success' | 'warn' | 'error' | 'info';
    icon?: {
        show?: boolean;
        class?: string;
        color?:
            | 'error'
            | 'basic'
            | 'info'
            | 'success'
            | 'warn';
    };
    actions?: {
        confirm?: {
            show?: boolean;
            label?: string;
            color?:
                | 'info'
                | 'danger';
        };
        cancel?: {
            show?: boolean;
            label?: string;
        };
    };
}
