const nodemailer = require('nodemailer');
const mongoConnection = require('./../db/numberConnection');
const UserModel = require('./../db/numberSchema');
const spawn = require('child_process').spawn;
const path = require('path');
 (async () => {
 	mongoConnection();

let startCount = await UserModel.count().exec();

let child = spawn('node',[path.join(__dirname, './../numberIndex.js')], {
	stdio: 'inherit'
});
let child2 = spawn('node',[path.join(__dirname, './../numberIndex.js')], {
  stdio: 'inherit'
});

let option = {
	less:{
		from:"huruji12@126.com",
		to: "594613537@qq.com",
		subject: '知乎用户爬虫爬取数量过少提醒',
		text: '现在10分钟爬取的数量小于 500，现在每10分钟爬取得数量大概是 ',
		html: ''
	},
	stop:{
		from:"huruji12@126.com",
		to: "594613537@qq.com",
		subject: '知乎用户爬虫可能停止提醒',
		text: '现在10分钟并没有增加数据，服务可能停止了，目前总数据为 ',
		html: ''
	},	
	day: {
		from:"huruji12@126.com",
		to: "594613537@qq.com",
		subject: '知乎用户爬虫提醒',
		text: '现在数据库中共有数据 ',
		html: ''
	},
	restart: {
    from:"huruji12@126.com",
    to: "594613537@qq.com",
    subject: '爬虫重启提醒',
    text: '服务重启成功，目前10分钟增加数据为 ',
    html: ''
	}
};

const transporter = nodemailer.createTransport({
	auth: {
		user: 'huruji12@126.com',
		pass: 'xie12345678'
	},
	host: 'smtp.126.com',
	port: 25,
	secure: false
})

function send(num) {
	if(num!== undefined) {
		let opt = {};
		if(num === 0) {
      opt.text += startCount;
		} else if(num <= 200) {
			console.log('数据过少');
      merge(opt, option.restart);
      opt.text += num;
      child.kill();
      child = spawn('node',[path.join(__dirname, './../numberIndex.js')], {
        stdio: 'inherit'
      });
      child2.kill();
      child2 = spawn('node',[path.join(__dirname, './../numberIndex.js')], {
        stdio: 'inherit'
      });
		}else {
			merge(opt, option.less);
			opt.text += num;
		}
    opt.html = '<h1>' + opt.text + '</h1>';
		transporter.sendMail(opt, function(err, info) {
			if(err) {
				console.log(err);
				console.log('\n');
				console.log('邮件发送失败');
				console.log(num);
			} else {
				console.log('邮件发送成功');
			}
		}) 
	} else {
		transporter.sendMail(option.day, function(err, info) {
			if(err) {
				console.log(err);
				console.log('\n');
				console.log('邮件发送失败');
			} else {
				console.log('邮件发送成功');
			}
		}) 
	}
	
}

async function taskAlert() {
	const count = await UserModel.count();
	let num = count - startCount;
	startCount = count;
	if(num <=600) {
    send(num);
	}
	setTimeout(taskAlert, 600000);
}

setTimeout(taskAlert, 600000);
 })();

 function merge(obj1, obj2) {
 	if(obj1 && obj2) {
 		for(let key in obj2) {
 			obj1[key] = obj2[key];
		}
	}
 }