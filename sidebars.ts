import type {SidebarsConfig} from '@docusaurus/plugin-content-docs';

const sidebars: SidebarsConfig = {
  mainSidebar: [
    'intro',
    {
      type: 'category',
      label: 'Get started',
      collapsed: false,
      items: [
        'getting-started/first-trade',
        'getting-started/get-prices',
        'realtime-chart-server/overview',
        'fx-server/general-rest-api-information',
      ],
    },
    {
      type: 'category',
      label: 'API reference',
      collapsed: false,
      items: [
        'fx-server/openapi-trader',
        'web-proxy/openapi',
        'realtime-chart-server/openapi',
      ],
    },
    {
      type: 'category',
      label: 'Trading concepts',
      items: [
        'business-logic/contract-overview',
        'business-logic/currency-overview',
        'business-logic/price-concept',
        'fx-server/price-steaming',
      ],
    },
  ],
};

export default sidebars;
