export interface BrandPreset {
  id: string;
  name: string;
  description?: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
  userId: string;

  logo?: {
    url: string;
    alignment: 'left' | 'center' | 'right';
    scale: number;
  };

  colors: {
    primary: string;
    secondary: string;
    background?: string;
    text: string;
  };

  signatory: {
    name: string;
    position: string;
    signatureUrl?: string;
    visible: boolean;
  };

  header: {
    institutionName: string;
    departmentName?: string;
    address?: string;
    motto?: string;
    alignment: 'left' | 'center' | 'right';
    fontFamily: string;
    fontSize: number;
  };

  participants?: {
    listId: string;
    fileName: string;
    uploadedAt: Date;
  };
}

export interface ParticipantData {
  name: string;
  role?: string;
  event?: string;
  date?: string;
  [key: string]: string | undefined;
}

export interface BrandPresetFormData {
  name: string;
  description?: string;
  logoFile?: File;
  logoAlignment: 'left' | 'center' | 'right';
  logoScale: number;
  primaryColor: string;
  secondaryColor: string;
  backgroundColor: string;
  textColor: string;
  signatoryName: string;
  signatoryPosition: string;
  signatureFile?: File;
  signatoryVisible: boolean;
  institutionName: string;
  departmentName?: string;
  address?: string;
  motto?: string;
  headerAlignment: 'left' | 'center' | 'right';
  headerFontFamily: string;
  headerFontSize: number;
}
