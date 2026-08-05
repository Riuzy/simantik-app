declare module 'pdfmake' {
  interface PdfMakeFontFace {
    normal: string;
    bold: string;
    italics: string;
    bolditalics: string;
  }

  interface PdfMakeOutputDocument {
    getBuffer(): Promise<Buffer>;
  }

  interface PdfMake {
    virtualfs: {
      writeFileSync(filename: string, content: Buffer): void;
    };
    setFonts(fonts: Record<string, PdfMakeFontFace>): void;
    setUrlAccessPolicy(callback: (url: string) => boolean): void;
    setLocalAccessPolicy(callback: (path: string) => boolean): void;
    createPdf(docDefinition: object, options?: object): PdfMakeOutputDocument;
  }

  const pdfmake: PdfMake;
  export default pdfmake;
}

declare module 'pdfmake/build/vfs_fonts' {
  const vfs: Record<string, string>;
  export default vfs;
}
