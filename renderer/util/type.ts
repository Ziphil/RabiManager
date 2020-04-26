//


// 配列 (もしくはタプル) 型である A の先頭に T を追加した型を返します。
// 例えば、Append<string, [number, symbol]> は [string, number, symbol] と評価されます。
export type Append<T, A extends Array<any>> = ((arg: T, ...rest: A) => void) extends ((...args: infer B) => void) ? B : never;

// タプル型の長さを数値リテラル型で返します。
export type Length<A> = A extends {length: infer N} ? N : never;

// 数値リテラル型 N に対し、0 以上 N 以下の整数から成る共用体型を返します。
// 例えば、OrBelow<3> は 0 | 1 | 2 | 3 に評価されます。
export type OrBelow<N extends number> = Length<OrBelowTuple<N>>;
type OrBelowTuple<N extends number> = OrBelowTupleRec<N, [], []>;
type OrBelowTupleRec<N, R, S extends Array<any>> = {0: R, 1: OrBelowTupleRec<N, R | Append<any, S>, Append<any, S>>}[S extends {length: N} ? 0 : 1];