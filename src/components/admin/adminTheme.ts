import type { ThemeConfig } from 'antd';

/** 管理后台浅色主题，与云盘主站 #5542f6 品牌色一致 */
export const adminTheme: ThemeConfig = {
  token: {
    colorPrimary: '#5542f6',
    colorSuccess: '#22c55e',
    colorWarning: '#f59e0b',
    colorError: '#ef4444',
    colorBgLayout: '#f4f5f7',
    colorBgContainer: '#ffffff',
    colorBorder: '#e8eaed',
    colorText: '#1f2937',
    colorTextSecondary: '#6b7280',
    borderRadius: 10,
    fontSize: 14,
    controlHeight: 40,
  },
  components: {
    Layout: {
      siderBg: '#ffffff',
      headerBg: '#ffffff',
      bodyBg: '#f4f5f7',
    },
    Menu: {
      itemHeight: 44,
      itemBorderRadius: 8,
      itemSelectedBg: '#f3f0ff',
      itemSelectedColor: '#5542f6',
      itemHoverBg: '#f9f8ff',
      itemActiveBg: '#ebe6ff',
      iconSize: 18,
    },
    Card: {
      boxShadowTertiary:
        '0 1px 3px rgba(15, 23, 42, 0.06), 0 1px 2px rgba(15, 23, 42, 0.04)',
    },
    Table: {
      headerBg: '#fafafa',
      headerColor: '#374151',
      rowHoverBg: '#faf9ff',
    },
    Button: {
      primaryShadow: '0 2px 0 rgba(85, 66, 246, 0.08)',
    },
    Input: {
      activeBorderColor: '#5542f6',
      hoverBorderColor: '#8b7cf8',
    },
  },
};
