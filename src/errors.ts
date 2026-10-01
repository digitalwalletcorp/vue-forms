/**
 * vue-formsがスローするエラー
 * 呼び出し側がvue-forms由来のエラーを判別できるように、専用のクラスにしている
 */
export class VueFormsError extends Error {
  constructor(message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = 'VueFormsError';
  }
}
