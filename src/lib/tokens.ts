export const tokens = {
  color: {
    background: {
      primary: "var(--app-bg-primary)",
      secondary: "var(--app-bg-secondary)",
      tertiary: "var(--app-bg-tertiary)",
    },
    accent: {
      primary: "var(--app-accent-primary)",
      hover: "var(--app-accent-hover)",
      subtle: "var(--app-accent-subtle)",
      tint: "var(--app-accent-tint)",
    },
    label: {
      primary: "var(--app-label-primary)",
      secondary: "var(--app-label-secondary)",
      tertiary: "var(--app-label-tertiary)",
      quaternary: "var(--app-label-quaternary)",
    },
    status: {
      danger: "var(--app-status-danger)",
      positive: "var(--app-status-positive)",
      info: "var(--app-status-info)",
      orange: "var(--app-status-orange)",
      yellow: "var(--app-status-yellow)",
    },
    fill: {
      f1: "var(--app-fill-f1)",
      f2: "var(--app-fill-f2)",
      f3: "var(--app-fill-f3)",
    },
    separator: "var(--app-separator)",
  },

  radius: {
    sm: "8px",
    md: "10px",
    lg: "12px",
    xl: "16px",
  },

  spacing: {
    xs: "4px",
    sm: "8px",
    md: "12px",
    lg: "16px",
    xl: "20px",
    "2xl": "24px",
    "3xl": "32px",
  },

  typography: {
    webUI: {
      largeTitleEmphasized: "text-[20px] font-semibold leading-[30px]",
      t1Regular: "text-[18px] font-normal leading-[26px]",
      t1Emphasized: "text-[18px] font-medium leading-[26px]",
      t2Regular: "text-[16px] font-normal leading-[24px]",
      t2Emphasized: "text-[16px] font-medium leading-[24px]",
      b1Regular: "text-[15px] font-normal leading-[22px]",
      b1Emphasized: "text-[15px] font-medium leading-[22px]",
      b2Regular: "text-[14px] font-normal leading-[20px]",
      b2Emphasized: "text-[14px] font-medium leading-[20px]",
      c1Regular: "text-[12px] font-normal leading-[18px]",
      c1Emphasized: "text-[12px] font-medium leading-[18px]",
    },
  },
} as const;

export type Tokens = typeof tokens;
