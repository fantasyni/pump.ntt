// Created with https://sui-dapp-kit-theme-creator.app
// Installation guide https://sdk.mystenlabs.com/dapp-kit/themes?utm_source=sui-dapp-kit-theme-creator

// Light color: #F6F7F9
// Dark color: #1f2a35

import type { ThemeVars } from '@mysten/dapp-kit'

export const lightTheme: ThemeVars = {
  blurs: {
    modalOverlay: 'blur(0)'
  },
  backgroundColors: {
    primaryButton: '#F6F7F9',
    primaryButtonHover: '#F0F2F5',
    outlineButtonHover: '#F0F2F5',
    modalOverlay: 'rgba(31, 42, 53, 0.1)',
    modalPrimary: '#F6F7F9',
    modalSecondary: '#F0F2F5',
    iconButton: 'transparent',
    iconButtonHover: '#F0F2F5',
    dropdownMenu: '#F6F7F9',
    dropdownMenuSeparator: '#F0F2F5',
    walletItemSelected: '#F6F7F9',
    walletItemHover: '#F0F2F5'
  },
  borderColors: {
    outlineButton: '#F0F2F5'
  },
  colors: {
    primaryButton: '#1f2a35',
    outlineButton: '#1f2a35',
    iconButton: '#1f2a35',
    body: '#1f2a35',
    bodyMuted: 'rgba(31, 42, 53, 0.7)',
    bodyDanger: '#FF794B'
  },
  radii: {
    small: '6px',
    medium: '8px',
    large: '12px',
    xlarge: '16px'
  },
  shadows: {
    primaryButton: '0px 4px 12px rgba(246, 247, 249, 0.1)',
    walletItemSelected: '0px 2px 6px rgba(246, 247, 249, 0.05)'
  },
  fontWeights: {
    normal: '400',
    medium: '500',
    bold: '600'
  },
  fontSizes: {
    small: '14px',
    medium: '16px',
    large: '18px',
    xlarge: '20px'
  },
  typography: {
    fontFamily: 'inherit',
    fontStyle: 'normal',
    lineHeight: '1.3',
    letterSpacing: '1'
  }
}

export const darkTheme: ThemeVars = {
  blurs: {
    modalOverlay: 'blur(0)'
  },
  backgroundColors: {
    primaryButton: '#1f2a35',
    primaryButtonHover: '#19222A',
    outlineButtonHover: '#19222A',
    modalOverlay: 'rgba(246, 247, 249, 0.1)',
    modalPrimary: '#1f2a35',
    modalSecondary: '#19222A',
    iconButton: 'transparent',
    iconButtonHover: '#19222A',
    dropdownMenu: '#1f2a35',
    dropdownMenuSeparator: '#19222A',
    walletItemSelected: '#1f2a35',
    walletItemHover: '#19222A'
  },
  borderColors: {
    outlineButton: '#19222A'
  },
  colors: {
    primaryButton: '#F6F7F9',
    outlineButton: '#F6F7F9',
    iconButton: '#F6F7F9',
    body: '#F6F7F9',
    bodyMuted: 'rgba(246, 247, 249, 0.7)',
    bodyDanger: '#FF794B'
  },
  radii: {
    small: '6px',
    medium: '8px',
    large: '12px',
    xlarge: '16px'
  },
  shadows: {
    primaryButton: '0px 4px 12px rgba(31, 42, 53, 0.1)',
    walletItemSelected: '0px 2px 6px rgba(31, 42, 53, 0.05)'
  },
  fontWeights: {
    normal: '400',
    medium: '500',
    bold: '600'
  },
  fontSizes: {
    small: '14px',
    medium: '16px',
    large: '18px',
    xlarge: '20px'
  },
  typography: {
    fontFamily: 'inherit',
    fontStyle: 'normal',
    lineHeight: '1.3',
    letterSpacing: '1'
  }
}
