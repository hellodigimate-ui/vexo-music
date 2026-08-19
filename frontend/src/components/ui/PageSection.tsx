import React from 'react';
import { cn } from '../../lib/utils';
import Container from './Container';

export interface PageSectionProps extends React.HTMLAttributes<HTMLElement> {
  children: React.ReactNode;
  variant?: 'bg' | 'surface' | 'card' | 'transparent';
  padding?: 'none' | 'sm' | 'md' | 'lg' | 'xl';
  containerSize?: 'sm' | 'md' | 'lg' | 'xl' | 'full';
  useContainer?: boolean;
}

export const PageSection: React.FC<PageSectionProps> = ({
  children,
  className,
  variant = 'bg',
  padding = 'lg',
  containerSize = 'xl',
  useContainer = true,
  ...props
}) => {
  const variantStyles = {
    bg: 'bg-vexo-bg text-vexo-white',
    surface: 'bg-vexo-surface text-vexo-white border-y border-white/5',
    card: 'bg-vexo-card text-vexo-white',
    transparent: 'bg-transparent text-vexo-white',
  };

  const paddingStyles = {
    none: 'py-0',
    sm: 'py-6 md:py-8',
    md: 'py-10 md:py-14',
    lg: 'py-14 md:py-20',
    xl: 'py-20 md:py-28',
  };

  const content = useContainer ? (
    <Container size={containerSize}>{children}</Container>
  ) : (
    children
  );

  return (
    <section
      className={cn(variantStyles[variant], paddingStyles[padding], className)}
      {...props}
    >
      {content}
    </section>
  );
};

export default PageSection;
