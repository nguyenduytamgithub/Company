CREATE DATABASE IF NOT EXISTS CMAcc;
SET SQL_SAFE_UPDATES = 0;

CREATE TABLE IF NOT EXISTS CMAcc.Account (
	id			NCHAR(12)		NOT NULL,
    username	NVARCHAR(50)	NOT NULL,
    pswd		NVARCHAR(512)	NOT NULL,
    salt		NVARCHAR(512)	NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS CMAcc.User (
	account		NCHAR(12)		NOT NULL,
    firstName	NVARCHAR(100)	NOT NULL,
    lastName	NVARCHAR(100)	NOT NULL,
    email		NCHAR(100),
    PRIMARY KEY (account),
    FOREIGN KEY (account) REFERENCES CMAcc.Account(id)
);

CREATE TABLE IF NOT EXISTS CMAcc.Role (
	id			INT				NOT NULL AUTO_INCREMENT,
    name		NVARCHAR(50)	NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS CMAcc.AccountRole (
	account		NCHAR(12)		NOT NULL,
    role		INT				NOT NULL,
    PRIMARY KEY (account, role),
    FOREIGN KEY (account) REFERENCES CMAcc.Account(id),
    FOREIGN KEY (role) REFERENCES CMAcc.Role(id)
);



DROP FUNCTION IF EXISTS CMAcc.CreateIDAccount;
DELIMITER //
CREATE FUNCTION CMAcc.CreateIDAccount
	()
	RETURNS TEXT
BEGIN
	SET @isExisted=1;
    WHILE (@isExisted > 0) DO
		SET @id=(SELECT SUBSTR(CONCAT(MD5(RAND()),MD5(RAND())),1,10));
		SET @isExisted=(SELECT COUNT(username) FROM CMAcc.Account WHERE id=@id);
    END WHILE;
    RETURN @id;
END; //
DELIMITER ;

DROP FUNCTION IF EXISTS CMAcc.GetRoleId;
DELIMITER //
CREATE FUNCTION CMAcc.GetRoleId
	(roleName NVARCHAR(50))
	RETURNS TEXT
BEGIN
	SET @id = (SELECT id FROM CMAcc.Role WHERE name=roleName);
    RETURN @id;
END; //
DELIMITER ;



DROP PROCEDURE IF EXISTS CMAcc.InsertAccount;
DELIMITER //
CREATE PROCEDURE CMAcc.InsertAccount
	(IN username NVARCHAR(50), IN pswd NVARCHAR(512), IN salt NVARCHAR(512))
BEGIN
    SET @id = (SELECT CMAcc.CreateIDAccount());
    INSERT INTO CMAcc.Account (id, username, pswd, salt) VALUES(@id, username, pswd, salt);
    SELECT @id as id;
END; //
DELIMITER ;

DROP PROCEDURE IF EXISTS CMAcc.InsertAccountRole;
DELIMITER //
CREATE PROCEDURE CMAcc.InsertAccountRole
	(IN userId NCHAR(12), IN roleName NVARCHAR(50))
BEGIN
    SET @roleId = (SELECT CMAcc.GetRoleId(roleName));
    INSERT INTO CMAcc.AccountRole (account, role) VALUES(userId, @roleId);
END; //
DELIMITER ;

INSERT INTO CMAcc.Role (name) VALUES("guest");
INSERT INTO CMAcc.Role (name) VALUES("tech");
INSERT INTO CMAcc.Role (name) VALUES("stech");
INSERT INTO CMAcc.Role (name) VALUES("manager");

SELECT * FROM CMAcc.Role;
SELECT * FROM CMAcc.Account;
SELECT * FROM CMAcc.AccountRole;
SELECT ar.account, r.name FROM CMAcc.AccountRole ar JOIN CMAcc.Role r ON ar.account="7ede1252c7" AND r.id=ar.role;
