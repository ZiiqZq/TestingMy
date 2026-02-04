declare module '@univerjs/core/facade' {
  import { Univer } from '@univerjs/core';
  
  export class FUniver {
    static newAPI(univer: Univer): any;
  }
}

declare module '@univerjs/ui/facade' {}
declare module '@univerjs/docs-ui/facade' {}
declare module '@univerjs/sheets/facade' {}
declare module '@univerjs/sheets-ui/facade' {}
declare module '@univerjs/sheets-formula/facade' {}
declare module '@univerjs/sheets-numfmt/facade' {}