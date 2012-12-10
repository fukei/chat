Tiny RealtimeChat
=====================

Tiny chat application using Node.js and  socket.io and jQueryMobile

How to use
---
    sudo apt-get install mongodb    (ubuntu)

    git clone https://github.com/kohuk/chat.git
    cd chat
    npm install
    node app.js

Changelog
---

    Ver 2.1.3
        不要なコードの削除
        SSLを止める
        socket.ioとexpressのSession共有
        Chromeの通知機能(jwNotify.js)

    Ver 2.1.2
        SSL対応
        socket.io update and Schema Change userid: Number -> String

    Ver 2.1.1
        無言投稿禁止
        httpリンク暫定対応
        scriptタグ禁止

    Ver 2.1
        ニックネームの設定箇所変更
