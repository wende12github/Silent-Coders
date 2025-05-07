import React from 'react';

interface CardProps {
    children: React.ReactNode;
    className?: string;
}

export const Card: React.FC<CardProps> = ({ children, className }) => (
    <div className={`rounded-lg border border-border bg-gradient-to-br from-white to-gray-50 text-card-foreground shadow-lg
                    dark:border-border-dark dark:bg-gradient-to-br dark:from-card-dark dark:to-gray-900 dark:text-card-foreground-dark
                    ${className || ''}`}>
        {children}
    </div>
);

interface CardHeaderProps {
    children: React.ReactNode;
    className?: string;
}

export const CardHeader: React.FC<CardHeaderProps> = ({ children, className }) => (
    <div className={`flex flex-col space-y-1.5 p-6 pb-4 ${className || ''}`}>
        {children}
    </div>
);

interface CardTitleProps {
    children: React.ReactNode;
    className?: string;
}

export const CardTitle: React.FC<CardTitleProps> = ({ children, className }) => (
    <h3 className={`text-2xl font-bold leading-none tracking-tight ${className || ''}`}>
        {children}
    </h3>
);

interface CardDescriptionProps {
    children: React.ReactNode;
    className?: string;
}

export const CardDescription: React.FC<CardDescriptionProps> = ({ children, className }) => (
    <p className={`text-sm text-muted-foreground dark:text-muted-foreground-dark mt-1 ${className || ''}`}>
        {children}
    </p>
);

interface CardContentProps {
    children: React.ReactNode;
    className?: string;
}

export const CardContent: React.FC<CardContentProps> = ({ children, className }) => (
    <div className={`p-6 pt-2 ${className || ''}`}>
        {children}
    </div>
);

interface CardFooterProps {
    children: React.ReactNode;
    className?: string;
}

export const CardFooter: React.FC<CardFooterProps> = ({ children, className }) => (
    <div className={`flex items-center p-6 pt-4 border-t border-border dark:border-border-dark ${className || ''}`}>
        {children}
    </div>
);
