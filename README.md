<div align="center">
<h1>Zajka</h1>
</div>


## 概要
PC 用ゲーム『Rabi-Ribi』のセーブデータを簡易的に管理するアプリケーションです。
Electron と React でデスクトップアプリケーションを試しに作ってみたかっただけというのもあります。

『Rabi-Ribi』では、一度に合計 30 個のセーブデータが利用できます。
以降、この 30 個のセーブデータ一式のことを「セーブグループ」と呼ぶことにします。
このアプリケーションは、ゲーム本体が参照するセーブグループを別の場所に保存したり、保存したセーブグループをゲーム本体が参照する場所に反映したりすることで、擬似的に 30 個以上のセーブデータを利用することができるようにします。

## 下準備と起動
npm パッケージになっているので、まずは以下のコマンドで必要なライブラリをインストールしてください。
```
npm install
```
これ以降は、以下のコマンドでアプリケーションが起動します。
```
npm run develop
```

## 使い方
アプリケーションは左右 2 つの画面に分かれています。

右の画面では、ゲーム本体が現在参照しているセーブグループに名前をつけて保存できます。
左の画面では、保存したゲームグループのうちどのデータをゲーム本体が参照するかを変更できます。