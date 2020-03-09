const prompts = require('prompts');
const fs = require('fs');

const { exec } = require('child_process');



let host_dir = '/var/www';

const questions = [
  {
    type: 'text',
    name: 'directory_name',
    message: 'Directory Name?'
    // validate: value => console.log(value.match('/^[a-z]/g'))
    // TODO: Validate user input later.
  },
  // {
  //   type: 'text',
  //   name: 'host_name',
  //   message: 'Host Name?'
  // }
];


( async () => {
    const response = await prompts(questions);

    const { directory_name } = response;

    host_dir = `${host_dir}/${directory_name}`;

    fs.exists(host_dir, (exists) => {

      if(exists) {
        return console.log('Folder already exists');
      }

      exec(`sudo mkdir -m 777 ${host_dir}`, (error, stdout, stderr) => {
        if(error) {
          console.log(error);
        }
        if(stdout) {
          console.log(`stdout ${stdout}`);
        }
        if(stderr) {
          console.log(`std error ${stderr}`);
        }
      });

      exec('wp --version', (error, stdout, stderr) => {
        if(stdout === '' && !(stdout.startsWith('WP-CLI')) ) {
          return console.log('This process require WP-Cli to be installed on this system. Please install.');
        }
      });

      exec(`wp core download --path=${host_dir}`, (error, stdout, stderr) => {
        if(error) {
          console.log(error);
        }
        if(stdout) {
          console.log(`stdout ${stdout}`);
        }
        if(stderr) {
          console.log(`std error ${stderr}`);
        }
	  });

	  const conf_file = `${directory_name.toLowerCase()}.local`;
	  const conf = `
		server {
			listen 80;
			listen [::]:80;
		
			root /var/www/eael-dev.local;
		
			# Add index.php to the list if you are using PHP
			index index.php index.html index.htm index.nginx-debian.html;
		
			server_name eael-dev.local www.eael-dev.local;
		
			location / {
				try_files $uri $uri/ =404;
			}
		
			# pass PHP scripts to FastCGI server
			location ~ \.php$ {
				include snippets/fastcgi-php.conf;
				fastcgi_pass unix:/var/run/php/php7.2-fpm.sock;
			}
		
			# deny access to .htaccess files, if Apache's document root
			location ~ /\.ht {
				deny all;
			}
		} 
	  `;

	  fs.writeFile(`/etc/nginx/sites-avialble/${conf_file}`, conf, function(error) {
		if(error) {
			return console.log(error);
		}
		console.log("This file written");
	  });
	  

	//   exec(`sudo cat ${conf}>/etc/nginx/sites-available/${conf_file}`, (error, stdout, stderr) => {
    //     if(error) {
    //       console.log(error);
    //     }
    //     if(stdout) {
    //       console.log(`stdout ${stdout}`);
    //     }
    //     if(stderr) {
    //       console.log(`std error ${stderr}`);
    //     }
	//   });






    });

})();