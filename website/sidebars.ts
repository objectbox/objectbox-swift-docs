import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  docs: [
    {
      type: 'doc',
      id: 'README', // This should be your main landing page, e.g., swift-docs.md
      label: 'ObjectBox Swift Database Docs',
    },
    {
      type: 'doc',
      id: 'install',
      label: 'Install ObjectBox Swift',
    },
    {
      type: 'doc',
      id: 'getting-started',
      label: 'Get Started with ObjectBox Swift',
    },
    {
      type: 'doc',
      id: 'entity-annotations',
      label: 'Entity Annotations in ObjectBox',
    },
    {
      type: 'doc',
      id: 'queries',
      label: 'Queries',
    },
    {
      type: 'doc',
      id: 'relations',
      label: 'Relations',
    },
    {
      type: 'doc',
      id: 'transactions',
      label: 'Transactions',
    },
    {
      type: 'doc',
      id: 'faq',
      label: 'ObjectBox Swift FAQ',
    },
    {
      type: 'link',
      label: 'Swift API Docs',
      href: 'https://objectbox.io/docfiles/swift/current/',
    },
    
    // --- Separator and Advanced Section ---
    {
      type: 'html',
      value: '<hr class="sidebar-divider" />', // Light grey line separator
    },
    {
      type: 'category',
      label: 'Advanced',
      collapsible: true, // if you set this to fals, it is always open
      items: [
        'advanced/macos',
        'advanced/custom-types',
        'advanced/data-model-updates',
        'advanced/meta-model-ids-and-uids',
        'advanced/manual-installation',
        'advanced/setup-script',
        'advanced/sourcery',
      ],
    },

    // --- Separator and External Links Section ---
    {
      type: 'html',
      value: '<hr class="sidebar-divider" />', // Light grey line separator
    },
    {
      type: 'link',
      label: 'Data Sync',
      href: 'https://objectbox.io/sync/',
    },
    {
      type: 'link',
      label: 'Android Database',
      href: 'https://docs.objectbox.io/',
    },
    {
      type: 'link',
      label: 'Flutter Database',
      href: 'https://pub.dev/packages/objectbox',
    },
  ],
};

export default sidebars;
