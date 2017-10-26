--Use carefully!!!
drop table if exists users;

create table users (
    email text CONSTRAINT pk_email PRIMARY KEY,
	name text NOT NULL
);