import { theme as antTheme, type ThemeConfig } from 'antd';

/** 浅色：白灰中性底 */
const LIGHT_PALETTE = {
  colorBgBase: '#f4f5f7',
  colorBgLayout: '#f4f5f7',
  colorBgContainer: '#ffffff',
  colorBgElevated: '#ffffff',
  colorBgSpotlight: '#f9fafb',
  colorBorder: '#e5e7eb',
  colorBorderSecondary: '#eceef2',
  colorText: '#1a1d26',
  colorTextSecondary: '#5c6370',
  colorTextTertiary: '#8b919d',
  colorTextQuaternary: '#b0b5bf',
  colorPrimary: '#5542f6',
  colorPrimaryHover: '#4535d4',
  colorPrimaryActive: '#4535d4',
  colorLink: '#5542f6',
  colorLinkHover: '#4535d4',
  colorInfo: '#5542f6',
  colorSuccess: '#52c41a',
  colorWarning: '#faad14',
  colorError: '#ff4d4f',
  controlItemBgHover: '#f3f4f6',
  controlItemBgActive: '#eceef2',
  colorErrorBg: '#fff1f0',
  colorErrorBgHover: '#fff1f0',
  colorErrorBorderHover: '#ff7875',
  colorErrorHover: '#a8071a',
} as const;

/** 深色：蓝紫域 */
const DARK_PALETTE = {
  colorBgBase: '#0e1018',
  colorBgLayout: '#0e1018',
  colorBgContainer: '#141824',
  colorBgElevated: '#1a2030',
  colorBgSpotlight: '#283040',
  colorBorder: '#313a4d',
  colorBorderSecondary: '#283040',
  colorText: '#e8eaf0',
  colorTextSecondary: '#a8afc0',
  colorTextTertiary: '#747b8f',
  colorTextQuaternary: '#565d72',
  colorPrimary: '#6d5cf7',
  colorPrimaryHover: '#8575f9',
  colorPrimaryActive: '#5542f6',
  colorLink: '#9d8fff',
  colorLinkHover: '#b4a8ff',
  colorInfo: '#7cb3ff',
  colorSuccess: '#4ade80',
  colorWarning: '#fbbf24',
  colorError: '#f87171',
  controlItemBgHover: '#222838',
  controlItemBgActive: '#283040',
  colorErrorBg: 'rgba(248, 113, 113, 0.14)',
  colorErrorBgHover: 'rgba(239, 68, 68, 0.22)',
  colorErrorBorderHover: '#fca5a5',
  colorErrorHover: '#fecaca',
} as const;

export function buildAntTheme(isDark: boolean): ThemeConfig {
  const palette = isDark ? DARK_PALETTE : LIGHT_PALETTE;

  return {
    algorithm: isDark ? antTheme.darkAlgorithm : antTheme.defaultAlgorithm,
    token: {
      borderRadius: 6,
      ...palette,
    },
    components: {
      Button: {
        primaryColor: '#ffffff',
        colorText: palette.colorText,
        defaultBg: palette.colorBgContainer,
        defaultBorderColor: palette.colorBorder,
      },
      Menu: isDark
        ? {
            itemColor: DARK_PALETTE.colorTextSecondary,
            itemSelectedColor: DARK_PALETTE.colorLink,
            itemSelectedBg: 'transparent',
            itemHoverBg: DARK_PALETTE.controlItemBgHover,
            itemActiveBg: DARK_PALETTE.controlItemBgActive,
            itemHeight: 50,
            darkItemBg: 'transparent',
          }
        : {
            itemColor: '#2e2c34',
            itemSelectedColor: '#5542f6',
            itemSelectedBg: 'transparent',
            itemHoverBg: '#f3f4f6',
            itemActiveBg: '#dedede',
            itemHeight: 50,
          },
      Modal: {
        contentBg: palette.colorBgElevated,
        headerBg: palette.colorBgElevated,
        footerBg: palette.colorBgElevated,
      },
      Dropdown: {
        colorBgElevated: palette.colorBgElevated,
      },
    },
  };
}
