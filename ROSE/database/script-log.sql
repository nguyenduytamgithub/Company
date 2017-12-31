CREATE DATABASE IF NOT EXISTS CMRoseLog;
SET SQL_SAFE_UPDATES = 0;


#########################################################################################
#										CREATE TABLES									#
#########################################################################################

CREATE TABLE IF NOT EXISTS CMRoseLog.Type (
	id			INT				AUTO_INCREMENT,
    name		NCHAR(20)		NOT NULL,
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS CMRoseLog.Log (
	id			NCHAR(12)		NOT NULL,
	user		NCHAR(12)		NOT NULL,
    flower		NCHAR(10)		NOT NULL,
    type		INT				NOT NULL,
    lastTime	DATETIME		DEFAULT CURRENT_TIMESTAMP,
    PRIMARY KEY (id),
    FOREIGN KEY (user) REFERENCES CMAcc.Account(id),
    FOREIGN KEY (type) REFERENCES CMRoseLog.Type(id)
);

CREATE TABLE IF NOT EXISTS CMRoseLog.Reason (
	logId		NCHAR(12)		NOT NULL,
    reason		NVARCHAR(150)	NOT NULL,
    PRIMARY KEY (logId),
    FOREIGN KEY (logId) REFERENCES CMRoseLog.Log(id)
);

#########################################################################################
#									CREATE FUNCTIONS									#
#########################################################################################

DROP FUNCTION IF EXISTS CMRoseLog.GetTypeId;
DELIMITER //
CREATE FUNCTION CMRoseLog.GetTypeId
	(typeName NVARCHAR(50))
	RETURNS TEXT
BEGIN
	SET @id = (SELECT id FROM CMRoseLog.Type WHERE name=typeName);
    RETURN @id;
END; //
DELIMITER ;

DROP FUNCTION IF EXISTS CMRoseLog.CreateID;
DELIMITER //
CREATE FUNCTION CMRoseLog.CreateID
	()
	RETURNS TEXT
BEGIN
	SET @isExisted=1;
    WHILE (@isExisted > 0) DO
		SET @id=(SELECT SUBSTR(CONCAT(MD5(RAND()),MD5(RAND())),1,10));
		SET @isExisted=(SELECT COUNT(user) FROM CMRoseLog.Log WHERE id=@id);
    END WHILE;
    RETURN @id;
END; //
DELIMITER ;

#########################################################################################
#									CREATE PROCEDURES									#
#########################################################################################

DROP PROCEDURE IF EXISTS CMRoseLog.Refresh;
DELIMITER //
CREATE PROCEDURE CMRoseLog.Refresh
	()
BEGIN
	START TRANSACTION;
	SET @delTime = (SELECT DATE_SUB(NOW() , INTERVAL 3 YEAR));
	DELETE FROM CMRoseLog.Log WHERE lastTime <= @delTime;
    COMMIT;
END; //
DELIMITER ;

DROP PROCEDURE IF EXISTS CMRoseLog.WriteLog;
DELIMITER //
CREATE PROCEDURE CMRoseLog.WriteLog
	(IN user NCHAR(12), IN flowerID NCHAR(10), IN typeName NCHAR(20), IN reason NVARCHAR(150))
BEGIN
	START TRANSACTION;
    SET @type = (SELECT CMRoseLog.GetTypeId(typeName));
    IF @type IS NULL
    THEN SET @type=1;
    END IF;
    SET @id=(SELECT CMRoseLog.CreateID());
    INSERT INTO CMRoseLog.Log (id, user, flower, type) VALUES (@id, user, flowerID, @type);
    IF length(reason) > 0
    THEN INSERT INTO CMRoseLog.Reason (logId, reason) VALUES (@id, reason);
    END IF;
    COMMIT;
END; //
DELIMITER ;

DROP PROCEDURE IF EXISTS CMRoseLog.GetLastLog;
DELIMITER //
CREATE PROCEDURE CMRoseLog.GetLastLog
	(IN flowerID NCHAR(10))
BEGIN
	SELECT * FROM CMRoseLog.Log WHERE flower=flowerID AND lastTime=(SELECT MAX(lastTime) FROM CMRoseLog.Log WHERE flower=flowerID);
END; //
DELIMITER ;

INSERT INTO CMRoseLog.Type (name) VALUES ('add');
INSERT INTO CMRoseLog.Type (name) VALUES ('update');
INSERT INTO CMRoseLog.Type (name) VALUES ('delete');
INSERT INTO CMRoseLog.Type (name) VALUES ('approve');
INSERT INTO CMRoseLog.Type (name) VALUES ('reject');

SELECT * FROM CMRoseLog.Log;
SELECT * FROM CMRoseLog.Reason;
SELECT * FROM CMRoseLog.Type;
