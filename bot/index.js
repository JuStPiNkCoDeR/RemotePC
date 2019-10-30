try {
    let TelegramBot = require('node-telegram-bot-api');
    let mongoose = require('mongoose');
    let config = require('./config');
    let exec = require('child_process').exec;
    let token = '627962353:AAHqh-S0tT7y_MN7e82yzRC57GLuGuvIKXE';
    let bot = new TelegramBot(token, {polling: true});
    const Schema = mongoose.Schema;
    let accountSchema = new Schema({
        tId: {
            type: String,
            required: true
        },
        login: {
            type: String,
            required: true
        },
        pass: {
            type: String,
            required: true
        }
    });
    let accountModel = mongoose.model('account', accountSchema);

    bot.onText(/\/start/, (msg, match) => {
        let fromId = msg.from.id;
        bot.sendMessage(fromId, 'Вас приветствует CommandDeliver бот!\n\n<b>Для того чтобы начать работать со мной, внесите свои данные для подключения к вашей сети</b>\n\nПример ввода:\n<b>Логин ваш_логин пароль ваш_пароль</b>', {parse_mode: "HTML"});
    });
    bot.onText(/Логин\s.+\sпароль\s.+/, (msg, match) => {
        let fromId = msg.from.id;
        mongoose.connect(config.get('mongoose:uri'), config.get('mongoose:options'), (err) => {
            if (err) bot.sendMessage(fromId, 'Произошла ошибка ' + err.toString());
            else {
                let text = msg.text.toString().split(' ');
                let login = text[1];
                pass = text[3];
                toSave = new accountModel({
                    tId: fromId,
                    login: login,
                    pass: pass
                });
                toSave.save((err) => {
                    if (err) bot.sendMessage(fromId, 'Произошла ошибка ' + err.toString());
                    else {
                        bot.sendMessage(fromId, 'Ваши данные успешно сохранены\n\nСписок доступных команд:\nСоздать папку => создать папку путь/имя_папки\n\nДля просмотра команд введите => список команд');
                    }
                });
            }
        });
    });
    bot.onText(/Список\sкоманд/, (msg, match) => {
        let fromId = msg.from.id;
        bot.sendMessage(fromId, 'Список доступных команд:\nСоздать папку => Создать папку путь/имя_папки');
    });
    bot.onText(/Создать\sпапку\s.+/, (msg, match) => {
        let fromId = msg.from.id;
        mongoose.connect(config.get('mongoose:uri'), config.get('mongoose:options'), (err) => {
            if (err) bot.sendMessage(fromId, 'Произошла ошибка ' + err.toString());
            else {
                accountModel.findOne({tId: fromId}).exec((err, ans) => {
                    if (err) bot.sendMessage(fromId, 'Произошла ошибка ' + err.toString());
                    else {
                       if (ans === null) bot.sendMessage(fromId, 'Для начала необходимо ввести свои данные для подключения к сети\n\nПример ввода:\n<b>Логин ваш_логин пароль ваш_пароль</b>', {parse_mode: "HTML"});
                       else {
                           path = msg.text.toString().split(' ');
                           exec('mkdir ' + path[2]);
                           bot.sendMessage(fromId, 'Папка успешно создана');
                       }
                    }
                });
            }
        });
    });
} catch (e) {
    console.log(e);
}