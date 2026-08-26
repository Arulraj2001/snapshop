import { getSiteConfig } from '@/lib/config'

export default async function ThemeInjector() {
  const siteConfig = await getSiteConfig()

  const primary = siteConfig.primaryColor || '#6040d1'
  const secondary = siteConfig.secondaryColor || '#9f2089'
  const bg = siteConfig.bgColor || '#f2f3fb'
  const gradientFrom = siteConfig.heroGradientFrom || primary
  const gradientTo = siteConfig.heroGradientTo || secondary

  return (
    <style
      dangerouslySetInnerHTML={{
        __html: `
          :root {
            --site-primary-color: ${primary};
            --site-secondary-color: ${secondary};
            --site-bg-color: ${bg};
            --site-hero-gradient-from: ${gradientFrom};
            --site-hero-gradient-to: ${gradientTo};
          }
          .theme-bg-primary { background-color: var(--site-primary-color) !important; }
          .theme-text-primary { color: var(--site-primary-color) !important; }
          .theme-border-primary { border-color: var(--site-primary-color) !important; }
        `,
      }}
    />
  )
}
