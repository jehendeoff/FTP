#!/usr/bin/expect

set username [lindex $argv 0];
set password [lindex $argv 1];
set timeout 5

#puts "$username $password"

if {[file exists /usr/bin/su]} {
    spawn /usr/bin/su $username
}
if {[file exists /bin/su]} {
    spawn /bin/su $username
}

expect -exact "Password:"
send "$password\n" 

expect { 
    -ex "su: " {
        puts "login failed"
        exit 1
    }
    -ex "@" {
        puts "login successful"
        send "exit\n"
        exit 0
    }
    timeout {
        puts "login failed (timeout)"
        exit 1
    }

    default { 
        puts "login failed (unknown reason)"
        exit 1
    }
}