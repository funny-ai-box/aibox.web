// apple-inspired-theme.js
// 类Apple设计风格的Ant Design主题配置

const theme = {
      token: {
        // 颜色系统
        colorPrimary: '#5B9BFF',
        colorSuccess: '#40C87B',
        colorWarning: '#FF9F7D',
        colorError: '#FF6B6B',
        colorInfo: '#5B9BFF',
        
        // 中性色系
        colorText: '#1D1D1F',
        colorTextSecondary: '#86868B',
        colorTextTertiary: '#8E8E93',
        colorBgContainer: '#FFFFFF',
        colorBgElevated: '#FFFFFF',
        colorBgLayout: '#F5F5F7',
        colorBorder: 'rgba(0, 0, 0, 0.06)',
        colorBorderSecondary: 'rgba(0, 0, 0, 0.04)',
        
        // 阴影
        boxShadow: '0 2px 8px rgba(0, 0, 0, 0.06)',
        boxShadowSecondary: '0 4px 20px rgba(0, 0, 0, 0.08)',
        
        // 圆角
        borderRadius: 12,
        borderRadiusLG: 16,
        borderRadiusSM: 8,
        
        // 字体
        fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, "Helvetica Neue", Arial, sans-serif',
        fontSize: 14,
        fontSizeLG: 16,
        fontSizeSM: 12,
        fontWeightStrong: 600,
        
        // 控件尺寸
        controlHeight: 40,
        controlHeightLG: 48,
        controlHeightSM: 32,
      },
      
      // 组件级别的定制
      components: {
        Button: {
          borderRadius: 8,
          controlHeight: 40,
          controlHeightLG: 48,
          controlHeightSM: 32,
          colorPrimaryHover: '#4B8BEF',
          defaultBorderColor: 'rgba(0, 0, 0, 0.1)',
          defaultColor: '#1D1D1F',
          defaultBg: '#FFFFFF',
          paddingInline: 20,
        },
        Input: {
          borderRadius: 12,
          activeBorderColor: 'rgba(0, 0, 0, 0.25)',
          hoverBorderColor: 'rgba(0, 0, 0, 0.15)',
          controlHeight: 40,
          controlHeightLG: 48,
          controlHeightSM: 32,
          paddingInline: 16,
        },
        Card: {
          borderRadius: 16,
          boxShadow: '0 4px 20px rgba(0, 0, 0, 0.06)',
          colorBorderSecondary: 'rgba(0, 0, 0, 0.04)',
          colorBgContainer: '#FFFFFF',
          paddingLG: 24,
        },
        Menu: {
          colorItemBg: 'transparent',
          colorItemText: '#1D1D1F',
          colorItemTextSelected: '#5B9BFF',
          colorItemBgSelected: 'rgba(91, 155, 255, 0.1)',
          colorItemTextHover: '#5B9BFF',
          colorItemBgHover: 'rgba(91, 155, 255, 0.05)',
          radiusItem: 8,
        },
        Table: {
          borderRadius: 12,
          colorBgContainer: '#FFFFFF',
          headerBg: '#FAFAFA',
          headerColor: '#1D1D1F',
          headerBorderRadius: 8,
          borderColor: 'rgba(0, 0, 0, 0.04)',
          rowHoverBg: 'rgba(91, 155, 255, 0.05)',
        },
        Select: {
          borderRadius: 12,
          controlHeight: 40,
          controlHeightLG: 48,
          controlHeightSM: 32,
          colorBorder: 'rgba(0, 0, 0, 0.1)',
          colorPrimaryHover: '#4B8BEF',
          optionSelectedBg: 'rgba(91, 155, 255, 0.1)',
          optionActiveBg: 'rgba(91, 155, 255, 0.05)',
        },
        Modal: {
          borderRadius: 16,
          titleColor: '#1D1D1F',
          contentBg: '#FFFFFF',
          boxShadow: '0 10px 30px rgba(0, 0, 0, 0.12)',
        },
        Tabs: {
          inkBarColor: '#5B9BFF',
          titleFontSize: 15,
          horizontalItemGutter: 32,
          horizontalItemPadding: '12px 0',
          titleFontSizeHover: 15,
          colorText: '#86868B',
          colorTextActive: '#1D1D1F',
        },
        Form: {
          itemMarginBottom: 24,
          labelColor: '#1D1D1F',
          labelFontSize: 14,
          labelHeight: 28,
        },
        Layout: {
          colorBgHeader: 'rgba(255, 255, 255, 0.8)',
          headerHeight: 64,
          headerPadding: '0 24px',
          colorBgBody: '#F5F5F7',
          bodyPadding: 24,
        },
        Alert: {
          borderRadius: 12,
          withDescriptionPadding: '16px 20px',
          withDescriptionIconSize: 24,
        },
        Avatar: {
          borderRadius: 12,
          groupOverlapping: -12,
        },
        Badge: {
          colorBgContainer: '#FFFFFF',
          badgeSize: 20,
          badgeFontSize: 12,
        },
        Tag: {
          borderRadius: 8,
          defaultBg: 'rgba(0, 0, 0, 0.05)',
          defaultColor: '#1D1D1F',
          paddingXS: '4px 8px',
        },
        Tooltip: {
          colorBgSpotlight: 'rgba(0, 0, 0, 0.75)',
          colorTextLightSolid: '#FFFFFF',
          borderRadius: 8,
          zIndexPopup: 1070,
        },
        Dropdown: {
          borderRadius: 12,
          controlItemBgHover: 'rgba(91, 155, 255, 0.05)',
        },
        Pagination: {
          itemSize: 32,
          itemSizeSM: 24,
          colorPrimary: '#5B9BFF',
          colorPrimaryHover: '#4B8BEF',
          itemActiveBg: '#5B9BFF',
          borderRadius: 8,
        },
      },
    };
    
    export default theme;