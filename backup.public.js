// NodeJS script.
// Резервное копирование БД confluence
// ===========================
// version: 0.1.0
// ===========================
'use strict';

const fs = require('fs');
// const nodemailer = require('nodemailer');
const nodemailer = require('c:\\Users\\Admin\\AppData\\Roaming\\npm\\node_modules\\nodemailer\\lib\\nodemailer'); //("./path/to/emailjs/email");
let listOfDumpFiles;
let listOfReservFiles;
let statOfDumpFile;
let dumpLength; 
let FIVE_DAYS = 432000000; // Количество милисекунд в 5 днях //todo парсить в дни и считать 5 штук
let DATE_NOW =  Date.now(); // Текущее время запуска скипта
let strDateNow = new Date(DATE_NOW);
let parseFileBirth; // распарсенное время создания файла дампа
let isPrintLogs = true; // нужен дебаг или нет!

/**
 * Транспорт для возможности отправки электронной почты
 * @type {Object}
 */
let transporter = nodemailer.createTransport({
    service: 'Yandex',
    auth: {
        user: '*********',
        pass: '************'
    }
});

/**
 * Заготовка письма для отправки
 * @type {Object}
 */
let mailOptions = {
    from: '"Backup NODEJS Service" <twinpix@yandex.ru>', // sender address
    to: 'taksenov@gmail.com', // list of receivers
    subject: 'Test', // Subject line
    text: 'TEST BACKUP', // plain text body
    html: '<p>TEST BACKUP</p>' // html body
};

/**
 * Установочные данные
 * @type {Object}
 */
let fileData = {
	DUMP_PATH: 'd:\\work\\TR\\',
	RESERV_PATH: 'd:\\work\\RES\\'
};

// Вспомогательные функции================================================
function realMonth(month) {
	return ++month;
};
// Вспомогательные функции================================================

// Прочитать список файлов в каталоге DUMP_PATH
try {
	listOfDumpFiles = fs.readdirSync(fileData.DUMP_PATH);
} catch (err) {
	if (isPrintLogs) console.log('DUMP_PATH Error is', err);
	// TODO сюда захеркать код который будет информировать об ошибке и осуществить выход из программы
	/**
	 * Отправка почты
	 * @param  {[type]} mailOptions письмо
	 * @param  {[type]} (error,     info          [description]
	 * @return {[type]}             [description]
	 */
	
	mailOptions.subject = 'Backup DUMP_PATH Error';
	mailOptions.text = 'DUMP_PATH Error is ' + err;
	mailOptions.html = '<p>DUMP_PATH Error is ' + err + '</p>';

	transporter.sendMail(mailOptions, (error, info) => {
	    if (error) {
	        if (isPrintLogs) console.log(error);
	 		return;
	    }
	    if (isPrintLogs) console.log('Message %s sent: %s', info.messageId, info.response);
	});

	process.exit();
}

// Прочитать список файлов в каталоге DUMP_PATH
try {
	listOfReservFiles = fs.readdirSync(fileData.RESERV_PATH);
} catch (err) {
	if (isPrintLogs) console.log('RESERV_PATH Error is', err);
	// TODO сюда захеркать код который будет информировать об ошибке и осуществить выход из программы
	/**
	 * Отправка почты
	 * @param  {[type]} mailOptions письмо
	 * @param  {[type]} (error,     info          [description]
	 * @return {[type]}             [description]
	 */
	
	mailOptions.subject = 'Backup RESERV_PATH Error';
	mailOptions.text = 'RESERV_PATH Error is ' + err;
	mailOptions.html = '<p>RESERV_PATH Error is ' + err + '</p>';	

	 transporter.sendMail(mailOptions, (error, info) => {
	 	if (error) {
	 		if (isPrintLogs) console.log(error);
 			return;	
	 	}
	 	if (isPrintLogs) console.log('Message %s sent: %s', info.messageId, info.response);
	 });

	process.exit();
}

dumpLength = listOfDumpFiles.length;

/**
 * обработать все файлы в каталоге DUMP_PATH
 * скопировать имя файла, дата создания которого равнасегодняшнему дню
 * удалить все файлы старше 5 суток
 */
for ( let i of listOfDumpFiles ) {

	// Прочитать свойства файлов в каталоге DUMP_PATH
	try {
		statOfDumpFile = fs.statSync(fileData.DUMP_PATH+i);  // statSync(path)
	} catch (err) {
		if (isPrintLogs) console.log('statSync Error is', err);
		// TODO сюда захеркать код который будет информировать об ошибке и осуществить выход из программы
		/**
		 * Отправка почты
		 * @param  {[type]} mailOptions письмо
		 * @param  {[type]} (error,     info          [description]
		 * @return {[type]}             [description]
		 */
		
		mailOptions.subject = 'Backup statSync Error';
		mailOptions.text = 'statSync Error is ' + err;
		mailOptions.html = '<p>statSync Error is ' + err + '</p>';		

		 transporter.sendMail(mailOptions, (error, info) => {
		 	if (error) {
		 		if (isPrintLogs) console.log(error);
		 		return;
		 	}
		 	if (isPrintLogs) console.log('Message %s sent: %s', info.messageId, info.response);
		 });

		process.exit();
	}

	// Работать только с файлами, каталоги пропускать
	if (!statOfDumpFile.isFile()) {
		continue;
	} 

	parseFileBirth = Date.parse(statOfDumpFile.ctime);

	// Если файл старше 5 дней, то пропустить его обработку, добавить в другой массив и удалить его из каталога,
	if ( parseFileBirth < (DATE_NOW - FIVE_DAYS) ) {
		fs.unlinkSync(fileData.DUMP_PATH+i);
		continue;
	}

	// Если есть файл созданный в день запуска скрипта и его нет в каталоге резерва, то скопировать его туда
	// todo учесть равенство стат свойств ino для файлов, упростить и запихать в переменные
	let dateToday = new Date();
	if ( dateToday.getDate() === statOfDumpFile.ctime.getDate() && (listOfReservFiles.indexOf(i) === -1 ) ) {
		let copiedFile = fs.createReadStream(fileData.DUMP_PATH+i);
		let bytesCopied = 0;
		let fileSize = statOfDumpFile.size;

		copiedFile.on('data', function(buffer){
			bytesCopied+= buffer.length
			let porcentage = ((bytesCopied/fileSize)*100).toFixed(2)
			if (isPrintLogs) console.log(porcentage+'%') 
		})

		copiedFile.on('end', function(){
			//todo здесь отправлять почту что дамп скопирован
			/**
			 * Отправка почты
			 * @param  {[type]} mailOptions письмо
			 * @param  {[type]} (error,     info          [description]
			 * @return {[type]}             [description]
			 */
			
			mailOptions.subject = 'Backup sucess';
			mailOptions.text = 'Copy of ' + i + ' to RESERV_PATH sucess. Date: ' + strDateNow;
			mailOptions.html = '<p>Copy of ' + i + ' to RESERV_PATH sucess. Date: ' + strDateNow + '</p>';			

			 transporter.sendMail(mailOptions, (error, info) => {
			 	if (error) {
			 		if (isPrintLogs) console.log(error);
		 			return;
			 	}
			 	if (isPrintLogs) console.log('Message %s sent: %s', info.messageId, info.response);
			 });

			if (isPrintLogs) console.log( `Copy of ${i} to RESERV_PATH sucess` );	
		})

		copiedFile.pipe(
			fs.createWriteStream(fileData.RESERV_PATH+i)
		);
	}
}

