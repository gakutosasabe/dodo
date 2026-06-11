const express = require('express');
const app = express();
const http = require('http').createServer(app);
const io = require('socket.io')(http);

app.use(express.static(__dirname));

// ==========================================
//  各画面へのルーティング
// ==========================================
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html');
});

app.get('/receiver', (req, res) => {
    res.sendFile(__dirname + '/receiver.html');
});

app.get('/sender', (req, res) => {
    res.sendFile(__dirname + '/sender.html');
});

// スマホアプリ画面へのルーティング
app.get('/application', (req, res) => {
    res.sendFile(__dirname + '/application.html');
});

// ==========================================
//  Socket.io の通信設定（リアルタイム連動用）
// ==========================================
io.on('connection', (socket) => {
    console.log('ユーザーが接続しました');

    // Senderやボタンからの画面切り替え指示を全員（Receiver等）に転送
    socket.on('render-display', (data) => {
        io.emit('render-display', data);
    });

    // Application（スマホ）側からのモード変更指示（environment等）を全員に転送
    socket.on('change-mode', (data) => {
        console.log('Applicationからモード変更を受信:', data.mode);
        // ReceiverやApplicationが持っている 'render-display' イベントに対してデータを流します
        io.emit('render-display', { mode: data.mode });
    });

    // 🎵 ★追加：Applicationから届いた「BGM変更指示」を全員（Receiver）にそのまま転送
    socket.on('bgm-selection-change', (data) => {
        console.log('BGM変更指示を転送:', data.bgmType);
        io.emit('bgm-selection-change', data);
    });

    // 🔊 ★追加：Application or Receiverから届いた「音量変更指示」を全員に相互転送
    socket.on('volume-change', (data) => {
        console.log('音量変更を同期:', data.volume);
        io.emit('volume-change', data);
    });

    socket.on('disconnect', () => {
        console.log('ユーザーが切断しました');
    });
});

// サーバーの起動ポート
const PORT = 3000;
http.listen(PORT, () => {
    console.log(`サーバーが起動しました！ http://localhost:${PORT}`);
    console.log(`- Receiver画面: http://localhost:${PORT}/receiver`);
    console.log(`- アプリ画面  : http://localhost:${PORT}/application`);
});