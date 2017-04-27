// NodeJS script.
// Резервное копирование БД confluence
// ===========================
// version: 0.0.2
// ===========================
// 
// Алгоритм работы:
// 
// +1) Получить доступ к каталогу с дампами DUMP_PATH
// +2) Получить доступ к каталогу куда будут резервироваться дампы RESERV_PATH
// +3) Проверить есть ли файлы в проверяемых каталогах
// +4) Прочитать данные из DUMP_PATH и сложить их в объект (массив объектов)
// +5) Прочитать данные из RESERV_PATH и сложить их в объект (массив объектов)
// 6) Крайний файл по дате, отсутствующий в RESERV_PATH, скопировать из DUMP_PATH в RESERV_PATH
// 7) Удалить самый старый файл из DUMP_PATH
// 8) Удалить самый старый файл из RESERV_PATH
// 9) Проверить, чтоб файлов было 5 штук!
// 10) Выслать письмо на электронку taksenov@gmail.com 
// 
// 
// TODO Внимание! Тимофейчик, учти работу со временем, пять дней это хорошо, но учесть нужно и когда фалов нет совсем. В общем продумай сначала логику, потом пиши код, а не наоборот
// todo сделать работу с переменными более прозрачной
// 
// 
// 
// ===========================

let fs = require('fs');
let listOfDumpFiles;
let listOfReservFiles;
let statOfDumpFile;
let statOfReservFile;
let dumpLength; 
let reservLength; 
let FIVE_DAYS = 432000000; // Количество милисекунд в 5 днях //todo парсить в дни и считать 5 штук
let DATE_NOW =  Date.now(); // Текущее время запуска скипта
let parseFileBirth; // распарсенное время создания файла дампа

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
	console.log('DUMP_PATH Error is', err);
	// TODO сюда захеркать код который будет информировать об ошибке и осуществить выход из программы
	process.exit();
}

// Прочитать список файлов в каталоге DUMP_PATH
try {
	listOfReservFiles = fs.readdirSync(fileData.RESERV_PATH);
} catch (err) {
	console.log('RESERV_PATH Error is', err);
	// TODO сюда захеркать код который будет информировать об ошибке и осуществить выход из программы
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
		console.log('statSync Error is', err);
		// TODO сюда захеркать код который будет информировать об ошибке и осуществить выход из программы
		process.exit();
	}

	// Работать только с файлами, каталоги пропускать
	if (!statOfDumpFile.isFile()) {
		continue;
	} 

	parseFileBirth = Date.parse(statOfDumpFile.birthtime);

	// Если файл старше 5 дней, то пропустить его обработку, добавить в другой массив и удалить его из каталога,
	if ( parseFileBirth < (DATE_NOW - FIVE_DAYS) ) {
		// todo создать массив и удалить файлы из этого массива, т.к. они старше 5 дней
		continue;
	}

	// Если есть файл созданный в день запуска скрипта и его нет в каталоге резерва, то скопировать его туда
	// todo учесть равенство стат свойств ino для файлов, упростить и запихать в переменные

	let dateToday = new Date();
	if ( dateToday.getDate() === statOfDumpFile.birthtime.getDate() && (listOfReservFiles.indexOf(i) === -1 ) ) {
		let copiedFile = fs.createReadStream(fileData.DUMP_PATH+i);
			
			copiedFile.pipe(
				fs.createWriteStream(fileData.RESERV_PATH+i)
			);
			copiedFile.p(
				process.stdout
			);
		console.log( `Copy of ${i} to RESERV_PATH sucess` );	




	}
	console.log('==========', listOfDumpFiles.indexOf(i), i,  statOfDumpFile.isFile());
	// console.log( dateToday.getDate(), ' - ', realMonth( dateToday.getMonth() ) );	
	// console.log( statOfDumpFile.birthtime.getDate(), ' - ', realMonth( statOfDumpFile.birthtime.getMonth() ) );	
	// console.log(`---`);	



}


console.log('End script');









// копирование через stream and pipe посмотреть видос от Ильи Кантора
// fs.createReadStream(fileData.sourcePath+fileData.fileName)
// 	.pipe(
// 			fs.createWriteStream(fileData.recieverPath+fileData.fileName)
// 		);