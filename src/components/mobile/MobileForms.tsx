import { useState } from 'react';
import { useIsMobile } from '@/hooks/use-mobile';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { 
  Search, 
  Eye, 
  EyeOff, 
  Check, 
  X,
  AlertCircle,
  CheckCircle
} from 'lucide-react';
import { cn } from '@/lib/utils';

interface MobileInputProps {
  label?: string;
  placeholder?: string;
  value: string;
  onChange: (value: string) => void;
  type?: 'text' | 'email' | 'password' | 'search' | 'number';
  error?: string;
  disabled?: boolean;
  icon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  onRightIconClick?: () => void;
  className?: string;
  inputClassName?: string;
}

export const MobileInput: React.FC<MobileInputProps> = ({
  label,
  placeholder,
  value,
  onChange,
  type = 'text',
  error,
  disabled,
  icon,
  rightIcon,
  onRightIconClick,
  className,
  inputClassName
}) => {
  const [showPassword, setShowPassword] = useState(false);
  const isMobile = useIsMobile();

  const getInputType = () => {
    if (type === 'password') {
      return showPassword ? 'text' : 'password';
    }
    return type;
  };

  return (
    <div className={cn('space-y-2', className)}>
      {label && (
        <Label className={cn(
          "text-foreground font-medium",
          isMobile ? "text-sm" : "text-sm"
        )}>
          {label}
        </Label>
      )}
      
      <div className="relative">
        {icon && (
          <div className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground">
            {icon}
          </div>
        )}
        
        <Input
          type={getInputType()}
          value={value}
          onChange={(e) => onChange(e.target.value)}
          placeholder={placeholder}
          disabled={disabled}
          className={cn(
            // Mobile optimizations
            isMobile && [
              "h-12 px-4 py-3 text-base rounded-xl",
              icon && "pl-10",
              (rightIcon || type === 'password') && "pr-10"
            ],
            !isMobile && [
              "h-10 px-3 py-2",
              icon && "pl-9",
              (rightIcon || type === 'password') && "pr-9"
            ],
            // States
            error && "border-destructive focus:border-destructive",
            disabled && "opacity-50 cursor-not-allowed",
            inputClassName
          )}
        />
        
        {type === 'password' && (
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
          </button>
        )}
        
        {rightIcon && onRightIconClick && (
          <button
            type="button"
            onClick={onRightIconClick}
            className="absolute right-3 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {rightIcon}
          </button>
        )}
      </div>
      
      {error && (
        <div className="flex items-center gap-2 text-destructive text-sm">
          <AlertCircle className="w-4 h-4" />
          {error}
        </div>
      )}
    </div>
  );
};

interface MobileSearchInputProps {
  value: string;
  onChange: (value: string) => void;
  placeholder?: string;
  onClear?: () => void;
  className?: string;
}

export const MobileSearchInput: React.FC<MobileSearchInputProps> = ({
  value,
  onChange,
  placeholder = "Search...",
  onClear,
  className
}) => {
  const isMobile = useIsMobile();

  return (
    <div className={cn("relative", className)}>
      <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-muted-foreground" />
      <Input
        type="search"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
        className={cn(
          "pl-12 pr-12",
          isMobile ? "h-12 rounded-xl text-base" : "h-10 rounded-lg"
        )}
      />
      {value && onClear && (
        <button
          onClick={onClear}
          className="absolute right-4 top-1/2 transform -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </div>
  );
};

interface MobileButtonProps {
  children: React.ReactNode;
  onClick?: () => void;
  variant?: 'default' | 'hero' | 'outline' | 'ghost';
  size?: 'sm' | 'md' | 'lg' | 'full';
  disabled?: boolean;
  loading?: boolean;
  leftIcon?: React.ReactNode;
  rightIcon?: React.ReactNode;
  className?: string;
  type?: 'button' | 'submit' | 'reset';
}

export const MobileButton: React.FC<MobileButtonProps> = ({
  children,
  onClick,
  variant = 'default',
  size = 'md',
  disabled = false,
  loading = false,
  leftIcon,
  rightIcon,
  className,
  type = 'button'
}) => {
  const isMobile = useIsMobile();

  const sizeClasses = {
    sm: isMobile ? "h-9 px-3 text-sm" : "h-8 px-3 text-sm",
    md: isMobile ? "h-12 px-6 text-base" : "h-10 px-4 text-sm",
    lg: isMobile ? "h-14 px-8 text-lg" : "h-12 px-6 text-base",
    full: "w-full"
  };

  const variantClasses = {
    default: "bg-primary text-primary-foreground hover:bg-primary/90",
    hero: "bg-gradient-primary text-primary-foreground hover:opacity-90",
    outline: "border border-border bg-background hover:bg-muted/50",
    ghost: "hover:bg-muted/50"
  };

  return (
    <Button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      className={cn(
        "font-medium rounded-xl transition-all duration-200",
        "active:scale-[0.98]",
        sizeClasses[size],
        variantClasses[variant],
        className
      )}
    >
      {loading ? (
        <div className="flex items-center gap-2">
          <div className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
          Loading...
        </div>
      ) : (
        <div className="flex items-center gap-2">
          {leftIcon}
          {children}
          {rightIcon}
        </div>
      )}
    </Button>
  );
};

interface MobileFormCardProps {
  title: string;
  description?: string;
  children: React.ReactNode;
  onSubmit?: (e: React.FormEvent) => void;
  className?: string;
}

export const MobileFormCard: React.FC<MobileFormCardProps> = ({
  title,
  description,
  children,
  onSubmit,
  className
}) => {
  const isMobile = useIsMobile();

  return (
    <Card className={cn(
      "bg-gradient-card border-0 shadow-medium",
      isMobile ? "p-6 rounded-2xl" : "p-8 rounded-xl",
      className
    )}>
      <div className="space-y-6">
        <div className="text-center">
          <h2 className={cn(
            "font-bold text-foreground",
            isMobile ? "text-xl" : "text-2xl"
          )}>
            {title}
          </h2>
          {description && (
            <p className={cn(
              "text-muted-foreground mt-2",
              isMobile ? "text-sm" : "text-base"
            )}>
              {description}
            </p>
          )}
        </div>
        
        <form onSubmit={onSubmit} className="space-y-4">
          {children}
        </form>
      </div>
    </Card>
  );
};

interface MobileValidationMessageProps {
  type: 'success' | 'error' | 'warning' | 'info';
  message: string;
  className?: string;
}

export const MobileValidationMessage: React.FC<MobileValidationMessageProps> = ({
  type,
  message,
  className
}) => {
  const isMobile = useIsMobile();

  const styles = {
    success: 'bg-success/10 text-success border-success/20',
    error: 'bg-destructive/10 text-destructive border-destructive/20',
    warning: 'bg-warning/10 text-warning border-warning/20',
    info: 'bg-primary/10 text-primary border-primary/20'
  };

  const icons = {
    success: CheckCircle,
    error: AlertCircle,
    warning: AlertCircle,
    info: AlertCircle
  };

  const Icon = icons[type];

  return (
    <div className={cn(
      "flex items-center gap-3 p-3 rounded-lg border",
      styles[type],
      className
    )}>
      <Icon className={cn(
        "flex-shrink-0",
        isMobile ? "w-5 h-5" : "w-4 h-4"
      )} />
      <p className={cn(
        "font-medium",
        isMobile ? "text-sm" : "text-sm"
      )}>
        {message}
      </p>
    </div>
  );
};

export default MobileInput;