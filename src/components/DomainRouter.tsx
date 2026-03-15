import { Navigate } from 'react-router-dom';
import { getCustomDomain, useAgencyByDomain } from '@/hooks/use-agency-by-domain';
import { Skeleton } from '@/components/ui/skeleton';

/**
 * If the user is visiting from a custom domain (e.g. atlas-travel.com),
 * this component redirects to the correct agency storefront route.
 * On platform domains it renders nothing (returns null) so normal routing takes over.
 */
const DomainRouter = ({ children }: { children: React.ReactNode }) => {
  const customDomain = getCustomDomain();
  const { data: agency, isLoading, isFetched } = useAgencyByDomain(customDomain);

  // Not a custom domain — render the normal app
  if (!customDomain) return <>{children}</>;

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <Skeleton className="h-12 w-48" />
      </div>
    );
  }

  if (isFetched && agency) {
    // Check if we're already on the correct storefront route
    const currentPath = window.location.pathname;
    const storefrontBase = `/agency/${agency.slug}`;

    if (!currentPath.startsWith(storefrontBase)) {
      // Redirect to the agency's storefront, preserving any sub-path
      return <Navigate to={`${storefrontBase}${currentPath === '/' ? '' : currentPath}`} replace />;
    }
  }

  if (isFetched && !agency) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background">
        <div className="text-center">
          <h1 className="text-3xl font-display font-bold text-foreground mb-2">Domain not configured</h1>
          <p className="text-muted-foreground">
            No agency is linked to <strong>{customDomain}</strong>
          </p>
        </div>
      </div>
    );
  }

  return <>{children}</>;
};

export default DomainRouter;
