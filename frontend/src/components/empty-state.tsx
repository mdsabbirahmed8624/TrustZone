'use client';

import React from 'react';
import { 
  Inbox, 
  Loader2, 
  AlertTriangle, 
  CheckCircle2, 
  Wrench, 
  WifiOff, 
  FolderOpen 
} from 'lucide-react';

// ----------------------------------------------------
// 1. EmptyState
// ----------------------------------------------------
export const EmptyState: React.FC<{
  title: string;
  description: string;
  icon?: React.ComponentType<{ className?: string }>;
  action?: React.ReactNode;
}> = ({ title, description, icon: Icon = FolderOpen, action }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-card/45 border border-dashed border-border rounded-xl min-h-[300px]">
      <div className="p-4 bg-muted rounded-full text-muted-foreground mb-4 border border-border/50">
        <Icon className="h-7 w-7" />
      </div>
      <h3 className="text-base font-bold text-foreground mb-1">{title}</h3>
      <p className="text-xs text-muted-foreground max-w-xs mb-5 leading-relaxed">{description}</p>
      {action && <div className="mt-1">{action}</div>}
    </div>
  );
};

// ----------------------------------------------------
// 2. NoDataState
// ----------------------------------------------------
export const NoDataState: React.FC<{ message?: string }> = ({ 
  message = "No matching records found in this view." 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4 text-center">
      <Inbox className="h-10 w-10 text-muted-foreground/60 mb-3.5 stroke-[1.5]" />
      <p className="text-sm font-medium text-muted-foreground">{message}</p>
      <span className="text-[11px] text-muted-foreground/60 mt-1">Try modifying your filters or search query terms.</span>
    </div>
  );
};

// ----------------------------------------------------
// 3. LoadingState
// ----------------------------------------------------
export const LoadingState: React.FC<{ message?: string }> = ({ 
  message = "Syncing enterprise database records..." 
}) => {
  return (
    <div className="flex flex-col items-center justify-center py-20 text-center">
      <Loader2 className="h-8 w-8 text-primary animate-spin mb-4" />
      <p className="text-sm font-semibold text-foreground/80">{message}</p>
      <span className="text-xs text-muted-foreground mt-1.5 animate-pulse">Requesting secure handshake...</span>
    </div>
  );
};

// ----------------------------------------------------
// 4. ErrorState
// ----------------------------------------------------
export const ErrorState: React.FC<{ 
  title?: string; 
  message: string; 
  onRetry?: () => void 
}> = ({ 
  title = "Database Request Failure", 
  message, 
  onRetry 
}) => {
  return (
    <div className="p-6 border border-red-500/20 bg-red-500/5 rounded-xl flex flex-col items-center text-center max-w-md mx-auto my-6">
      <AlertTriangle className="h-8 w-8 text-red-500 mb-3" />
      <h4 className="text-sm font-bold text-foreground mb-1">{title}</h4>
      <p className="text-xs text-muted-foreground mb-4 leading-relaxed">{message}</p>
      {onRetry && (
        <button
          onClick={onRetry}
          className="px-4 py-2 bg-red-500 text-white rounded-lg text-xs font-semibold hover:bg-red-600 transition"
        >
          Try Again
        </button>
      )}
    </div>
  );
};

// ----------------------------------------------------
// 5. SuccessState
// ----------------------------------------------------
export const SuccessState: React.FC<{ 
  title: string; 
  message: string; 
  action?: React.ReactNode 
}> = ({ title, message, action }) => {
  return (
    <div className="p-8 bg-card border border-border/80 rounded-xl shadow-lg flex flex-col items-center text-center max-w-sm mx-auto">
      <div className="h-12 w-12 bg-green-500/10 text-green-500 rounded-full flex items-center justify-center mb-4 border border-green-500/20">
        <CheckCircle2 className="h-6 w-6" />
      </div>
      <h4 className="text-base font-bold text-foreground mb-1">{title}</h4>
      <p className="text-xs text-muted-foreground mb-5 leading-relaxed">{message}</p>
      {action}
    </div>
  );
};

// ----------------------------------------------------
// 6. MaintenanceState
// ----------------------------------------------------
export const MaintenanceState: React.FC<{ moduleName: string }> = ({ moduleName }) => {
  return (
    <div className="flex flex-col items-center justify-center p-12 text-center bg-secondary/30 border border-border rounded-xl min-h-[350px]">
      <div className="p-4 bg-primary/10 text-primary rounded-full mb-4 border border-primary/20 animate-pulse">
        <Wrench className="h-8 w-8" />
      </div>
      <h3 className="text-lg font-bold text-foreground mb-1">
        {moduleName} Module Pending
      </h3>
      <p className="text-xs text-muted-foreground max-w-sm mb-4 leading-relaxed">
        This section is staged for Phase 3 Book 2. The database layers, API routes, and RBAC guards are active, but the frontend views are currently under construction.
      </p>
      <span className="text-[10px] uppercase font-bold tracking-wider px-2.5 py-1 bg-primary/10 text-primary rounded-full">
        Feature Flagged
      </span>
    </div>
  );
};

// ----------------------------------------------------
// 7. OfflineState
// ----------------------------------------------------
export const OfflineState: React.FC<{ onReconnect?: () => void }> = ({ onReconnect }) => {
  return (
    <div className="flex flex-col items-center justify-center p-8 text-center bg-amber-500/5 border border-dashed border-amber-500/35 rounded-xl min-h-[300px]">
      <div className="p-4 bg-amber-500/10 text-amber-500 rounded-full mb-4 border border-amber-500/20">
        <WifiOff className="h-7 w-7" />
      </div>
      <h3 className="text-sm font-bold text-foreground mb-1">Handshake Interrupted</h3>
      <p className="text-xs text-muted-foreground max-w-xs mb-5 leading-relaxed">
        The application is running in local diagnostic mode. Connect to the NestJS server at port 4000 to enable real-time database syncing.
      </p>
      {onReconnect && (
        <button
          onClick={onReconnect}
          className="px-4.5 py-2 bg-amber-500 text-white rounded-lg text-xs font-semibold hover:bg-amber-600 transition"
        >
          Check Connection
        </button>
      )}
    </div>
  );
};
