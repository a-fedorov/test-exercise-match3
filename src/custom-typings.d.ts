declare var require: any;

declare module '*.json' {
  const value: any;
  export default value;
}

declare var config: any;

// declare interface Config {
//   debug: boolean;
//   game: {
//     width: number,
//     height: number,
//     maxWidth: number,
//     maxHeight: number,
//     scaleMode: string
//   }
// }
