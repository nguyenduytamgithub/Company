CREATE DATABASE IF NOT EXISTS CMPendRose;
SET SQL_SAFE_UPDATES = 0;


#########################################################################################
#										CREATE TABLES									#
#########################################################################################

CREATE TABLE IF NOT EXISTS CMPendRose.Pests (
	id			INT					NOT NULL AUTO_INCREMENT,
    name		NVARCHAR(50),
    agent		NVARCHAR(150),
    sign		NVARCHAR(150),
    solution	NVARCHAR(150),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS CMPendRose.Type (
	id			INT					NOT NULL AUTO_INCREMENT,
	name		NVARCHAR(50),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS CMPendRose.Color (
	id			INT					NOT NULL AUTO_INCREMENT,
    name		NVARCHAR(50),
    hex			NCHAR(20),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS CMPendRose.Origin (
	id			INT					NOT NULL AUTO_INCREMENT,
    name		NCHAR(50),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS CMPendRose.Flower (
	id			NCHAR(10)			NOT NULL,
    name		NVARCHAR(50),
    sciname		NVARCHAR(50),
    type		INT,
    heightMin	DOUBLE,								# chiều cao (m)
    heightMax	DOUBLE,
    widthMin	DOUBLE,								# chiều rộng (m)
    widthMax	DOUBLE,
	fragrance	NVARCHAR(150), 						# hương thơm
    petal		NVARCHAR(150), 						# miêu tả cánh hoa
    numPetals	NCHAR(15),							# số lượng cánh hoa (format: ~40 hay >40 hay <40)
    diameterMin	DOUBLE,								# đường kính hoa (cm)
    diameterMax	DOUBLE,
    bloom		NVARCHAR(150),						# mùa hoa nở
    tolerance	DOUBLE,								# khả năng kháng bệnh (%)
    timeMin		INT,								# khoảng thời gian mà hoa nở tươi (ngày)
    timeMax		INT,
    note		NVARCHAR(150),						# ghi chú thêm (vd: lượng nước cần thiết, nơi để trồng, yêu cầu chăm sóc)
    PRIMARY KEY (id),
    FOREIGN KEY (type) REFERENCES CMPendRose.Type(id)
);

CREATE TABLE IF NOT EXISTS CMPendRose.FlowerTechInfo (
	flower		NCHAR(10)			NOT NULL,
    age			INT					NOT NULL,
    moisMin		DOUBLE				DEFAULT 0.0, 	# độ ẩm chất trồng
    moisMax		DOUBLE				DEFAULT 0.0, 	# độ ẩm chất trồng
    tempMin		DOUBLE				DEFAULT 0.0, 	# nhiệt độ chất trồng
    tempMax		DOUBLE				DEFAULT 0.0,
    pHMin		DOUBLE				DEFAULT 0.0,
    pHMax		DOUBLE				DEFAULT 0.0,
    ECMin		DOUBLE				DEFAULT 0.0,	# EC (Electricity Conductivity) của đất
    ECMax		DOUBLE				DEFAULT 0.0,
    solarMin	INT					DEFAULT 0,		# số giờ nắng
    solarMax	INT					DEFAULT 0,
    PRIMARY KEY (flower, age),
    FOREIGN KEY (flower) REFERENCES CMPendRose.Flower(id)
);

CREATE TABLE IF NOT EXISTS CMPendRose.FlowerOrigin (
	flower		NCHAR(10)			NOT NULL,
    origin		INT					NOT NULL,
    year		INT,
    PRIMARY KEY (flower, origin),
    FOREIGN KEY (flower) REFERENCES CMPendRose.Flower(id),
    FOREIGN KEY (origin) REFERENCES CMPendRose.Origin(id)
);

CREATE TABLE IF NOT EXISTS CMPendRose.FlowerColor (
	flower		NCHAR(10)			NOT NULL,
    color		INT					NOT NULL,
    PRIMARY KEY (flower, color),
    FOREIGN KEY (flower) REFERENCES CMPendRose.Flower(id),
    FOREIGN KEY (color) REFERENCES CMPendRose.Color(id)
);

CREATE TABLE IF NOT EXISTS CMPendRose.FlowerPests (
	flower		NCHAR(10)			NOT NULL,
    pests		INT					NOT NULL,
    PRIMARY KEY (flower, pests),
    FOREIGN KEY (flower) REFERENCES CMPendRose.Flower(id),
    FOREIGN KEY (pests) REFERENCES CMPendRose.Pests(id)
);

CREATE TABLE IF NOT EXISTS CMPendRose.FlowerImage (
	flower		NCHAR(10)			NOT NULL,
    numImgs		INT					DEFAULT 0,
    main		INT					DEFAULT 0,
    PRIMARY KEY (flower),
    FOREIGN KEY (flower) REFERENCES CMPendRose.Flower(id)
);

CREATE TABLE IF NOT EXISTS CMPendRose.FlowerGrowth (
	flower		NCHAR(10)			NOT NULL,
    age			INT					NOT NULL,
    tolerance	DOUBLE				DEFAULT 0.0,	# khả năng kháng bệnh (%)
    height		DOUBLE				DEFAULT 0.0,
    width		DOUBLE				DEFAULT 0.0,
    budTime		INT					DEFAULT 0,		# thời gian kết nụ (ngày)
    numBuds		INT					DEFAULT 0,		# số lượng nụ
    flowerTime	INT					DEFAULT 0,		# thời gian nở hoa (ngày)
    numFlowers	INT					DEFAULT 0,		# số lượng hoa
    diameter	DOUBLE				DEFAULT 0.0,	# đường kính hoa (cm)
    numPetals	INT					DEFAULT 0,		# số lượng cánh hoa
    fragrance	NVARCHAR(150), 						# hương thơm
    PRIMARY KEY (flower, age),
    FOREIGN KEY (flower) REFERENCES CMPendRose.Flower(id)
);

CREATE TABLE IF NOT EXISTS CMPendRose.FlowerId (
	flower		NCHAR(10)			NOT NULL,
    definedId	NCHAR(50),							# id do người dùng định nghĩa
    PRIMARY KEY (flower),
    FOREIGN KEY (flower) REFERENCES CMPendRose.Flower(id)
);


#########################################################################################
#									CREATE FUNCTIONS									#
#########################################################################################

DROP FUNCTION IF EXISTS CMPendRose.CheckIDFlower;
DELIMITER //
CREATE FUNCTION CMPendRose.CheckIDFlower
	(id NCHAR(10))
	RETURNS BOOL
BEGIN
	IF NOT TRUE
    THEN RETURN FALSE;
    END IF;
    RETURN TRUE;
END; //
DELIMITER ;

DROP FUNCTION IF EXISTS CMPendRose.CreateIDFlower;
DELIMITER //
CREATE FUNCTION CMPendRose.CreateIDFlower
	()
	RETURNS TEXT
BEGIN
	SET @name=(SELECT SUBSTR(CONCAT(MD5(RAND()),MD5(RAND())),1,10));
    RETURN @name;
END; //
DELIMITER ;

DROP FUNCTION IF EXISTS CMPendRose.GetIDType;
DELIMITER //
CREATE FUNCTION CMPendRose.GetIDType
	(typeName NCHAR(50))
	RETURNS INT
BEGIN
    RETURN (SELECT id FROM CMPendRose.Type WHERE name=typeName);
END; //
DELIMITER ;

DROP FUNCTION IF EXISTS CMPendRose.GetIDColor;
DELIMITER //
CREATE FUNCTION CMPendRose.GetIDColor
	(colorName NCHAR(50))
	RETURNS INT
BEGIN
    RETURN (SELECT id FROM CMPendRose.Color WHERE name=colorName);
END; //
DELIMITER ;

DROP FUNCTION IF EXISTS CMPendRose.GetIDOrigin;
DELIMITER //
CREATE FUNCTION CMPendRose.GetIDOrigin
	(originName NCHAR(50))
	RETURNS INT
BEGIN
    RETURN (SELECT id FROM CMPendRose.Origin WHERE name=originName);
END; //
DELIMITER ;

DROP FUNCTION IF EXISTS CMPendRose.GetIDPests;
DELIMITER //
CREATE FUNCTION CMPendRose.GetIDPests
	(pestsName NCHAR(50))
	RETURNS INT
BEGIN
    RETURN (SELECT id FROM CMPendRose.Pests WHERE name=pestsName);
END; //
DELIMITER ;

#########################################################################################
#									CREATE TRIGGERS										#
#########################################################################################

DROP TRIGGER IF EXISTS CMPendRose.InsertFlowerTrigger;
DELIMITER //
CREATE TRIGGER CMPendRose.InsertFlowerTrigger
BEFORE INSERT on CMPendRose.Flower
FOR EACH ROW
BEGIN
	IF NOT CMPendRose.CheckIDFlower(NEW.id)
    THEN
		SIGNAL SQLSTATE '45000'
		SET MESSAGE_TEXT = 'Invalid flower\'s ID';
    END IF;
    
    IF NEW.type IS NULL OR NEW.type = ''
    THEN
		SET NEW.type = 1;
    END IF;
END; //
DELIMITER ;

DROP TRIGGER IF EXISTS CMPendRose.UpdateFlowerTrigger;
DELIMITER //
CREATE TRIGGER CMPendRose.UpdateFlowerTrigger
BEFORE UPDATE on CMPendRose.Flower
FOR EACH ROW
BEGIN
	IF NOT CMPendRose.CheckIDFlower(NEW.id)
    THEN
		SIGNAL SQLSTATE '45000'
		SET MESSAGE_TEXT = 'Invalid flower\'s ID';
    END IF;
    
    IF NEW.type IS NULL OR NEW.type = ''
    THEN
		SET NEW.type = 1;
    END IF;
END; //
DELIMITER ;


#########################################################################################
#									CREATE PROCEDURES									#
#########################################################################################

#									Insert procedures									#

DROP PROCEDURE IF EXISTS CMPendRose.InsertFlower;
DELIMITER //
CREATE PROCEDURE CMPendRose.InsertFlower
	(OUT id NCHAR(10), IN definedId NCHAR(50), IN name NVARCHAR(50), IN sciname NVARCHAR(50), IN typeName NVARCHAR(50), IN heightMin DOUBLE, IN heightMax DOUBLE, IN widthMin DOUBLE, IN widthMax DOUBLE,
     IN fragrance NVARCHAR(150), IN petal NVARCHAR(150), IN numPetals NCHAR(15), IN diameterMin DOUBLE, IN diameterMax DOUBLE,
     IN bloom NVARCHAR(150), IN tolerance DOUBLE, IN timeMin INT, IN timeMax INT, IN note NVARCHAR(150))
BEGIN
	IF typeName != '' THEN
		SET @type = (SELECT CMPendRose.GetIDType(typeName));
		
		IF @type IS NULL 
		THEN
			INSERT INTO CMPendRose.Type (name) VALUES(typeName);
			SET @type = (SELECT LAST_INSERT_ID());
		END IF;
	ELSE
		SET @type = NULL;
	END IF;
    
    SET id = (SELECT CMPendRose.CreateIDFlower());
    
    INSERT INTO CMPendRose.Flower (id, name, sciname, type, heightMin, heightMax, widthMin, widthMax, fragrance, petal, numPetals, diameterMin, diameterMax, bloom, tolerance, timeMin, timeMax, note)
    VALUES(id, name, sciname, @type, heightMin, heightMax, widthMin, widthMax, fragrance, petal, numPetals, diameterMin, diameterMax, bloom, tolerance, timeMin, timeMax, note);
    
    INSERT INTO CMPendRose.FlowerId (flower, definedId) VALUES(id, definedId);
    
    SELECT id;
END; //
DELIMITER ;

DROP PROCEDURE IF EXISTS CMPendRose.InsertFlowerOrigin;
DELIMITER //
CREATE PROCEDURE CMPendRose.InsertFlowerOrigin
	(IN flower NCHAR(10), IN originName NVARCHAR(50), IN year INT)
BEGIN
    SET @origin = (SELECT CMPendRose.GetIDOrigin(originName));
    
    IF @origin IS NULL
    THEN
		INSERT INTO CMPendRose.Origin (name) VALUES(originName);
        SET @origin = (SELECT LAST_INSERT_ID());
    END IF;
    
    INSERT INTO CMPendRose.FlowerOrigin (flower, origin, year) VALUES (flower, @origin, year);
END; //
DELIMITER ;

DROP PROCEDURE IF EXISTS CMPendRose.InsertFlowerColor;
DELIMITER //
CREATE PROCEDURE CMPendRose.InsertFlowerColor
	(IN flower NCHAR(10), IN colorName NVARCHAR(50), IN hex NCHAR(20))
BEGIN
    SET @color = (SELECT CMPendRose.GetIDColor(colorName));
    
    IF @color IS NULL
    THEN
		INSERT INTO CMPendRose.Color (name, hex) VALUES(colorName, hex);
        SET @color = (SELECT LAST_INSERT_ID());
    END IF;
    
    INSERT INTO CMPendRose.FlowerColor (flower, color) VALUES (flower, @color);
END; //
DELIMITER ;

DROP PROCEDURE IF EXISTS CMPendRose.InsertFlowerPests;
DELIMITER //
CREATE PROCEDURE CMPendRose.InsertFlowerPests
	(IN flower NCHAR(10), IN pestsName NVARCHAR(50), IN agent NVARCHAR(150),
    IN sign NVARCHAR(150), IN solution NVARCHAR(150))
BEGIN
    SET @pests = (SELECT CMPendRose.GetIDPests(pestsName));
    
    IF @pests IS NULL
    THEN
		INSERT INTO CMPendRose.Pests (name, agent, sign, solution) VALUES(pestsName, agent, sign, solution);
        SET @pests = (SELECT LAST_INSERT_ID());
    END IF;
    
    INSERT INTO CMPendRose.FlowerPests (flower, pests) VALUES (flower, @pests);
END; //
DELIMITER ;

DROP PROCEDURE IF EXISTS CMPendRose.InsertFlowerTechInfo;
DELIMITER //
CREATE PROCEDURE CMPendRose.InsertFlowerTechInfo
	(IN flower NCHAR(10), IN age INT, IN moisMin DOUBLE, IN moisMax DOUBLE, IN tempMin DOUBLE, IN tempMax DOUBLE,
    IN pHMin DOUBLE, IN pHMax DOUBLE, IN ECMin DOUBLE, IN ECMax DOUBLE, IN solarMin INT, IN solarMax INT)
BEGIN
    INSERT INTO CMPendRose.FlowerTechInfo
	(flower, age, moisMin, moisMax, tempMin, tempMax, pHMin, pHMax, ECMin, ECMax, solarMin, solarMax)
	VALUES (flower, age, moisMin, moisMax, tempMin, tempMax, pHMin, pHMax, ECMin, ECMax, solarMin, solarMax);
END; //
DELIMITER ;

DROP PROCEDURE IF EXISTS CMPendRose.InsertFlowerImage;
DELIMITER //
CREATE PROCEDURE CMPendRose.InsertFlowerImage
	(IN flower NCHAR(10), IN numImgs INT, IN main INT)
BEGIN
    INSERT INTO CMPendRose.FlowerImage (flower, numImgs, main) VALUES (flower, numImgs, main);
END; //
DELIMITER ;

DROP PROCEDURE IF EXISTS CMPendRose.InsertFlowerGrowth;
DELIMITER //
CREATE PROCEDURE CMPendRose.InsertFlowerGrowth
	(IN flower NCHAR(10), IN age INT, IN tolerance DOUBLE, IN height DOUBLE, IN width DOUBLE, IN budTime INT,
    IN numBuds INT, IN flowerTime INT, IN numFlowers INT, IN diameter DOUBLE, IN numPetals INT, IN fragrance NVARCHAR(150))
BEGIN
    INSERT INTO CMPendRose.FlowerGrowth
	(flower, age, tolerance, height, width, budTime, numBuds, flowerTime, numFlowers, diameter, numPetals, fragrance)
	VALUES (flower, age, tolerance, height, width, budTime, numBuds, flowerTime, numFlowers, diameter, numPetals, fragrance);
END; //
DELIMITER ;

#									Update procedures									#

DROP PROCEDURE IF EXISTS CMPendRose.UpdateFlower;
DELIMITER //
CREATE PROCEDURE CMPendRose.UpdateFlower
	(IN flowerID VARCHAR(10), IN name NVARCHAR(50), IN sciname NVARCHAR(50), IN typeName NVARCHAR(50), IN heightMin DOUBLE, IN heightMax DOUBLE, IN widthMin DOUBLE, IN widthMax DOUBLE,
     IN fragrance NVARCHAR(150), IN petal NVARCHAR(150), IN numPetals NCHAR(15), IN diameterMin DOUBLE, IN diameterMax DOUBLE,
     IN bloom NVARCHAR(150), IN tolerance DOUBLE, IN timeMin INT, IN timeMax INT, IN note NVARCHAR(150))
BEGIN
	SET @type = (SELECT CMPendRose.GetIDType(typeName));
    
	IF @type IS NULL
    THEN
		INSERT INTO CMPendRose.Type (name) VALUES(typeName);
        SET @type = (SELECT LAST_INSERT_ID());
    END IF;
    
    UPDATE CMPendRose.Flower
    SET name=name, sciname=sciname, type=@type, heightMin=heightMin, heightMax=heightMax, widthMin=widthMin, widthMax=widthMax, fragrance=fragrance, petal=petal, numPetals=numPetals, diameterMin=diameterMin, diameterMax=diameterMax, bloom=bloom, tolerance=tolerance, timeMin=timeMin, timeMax=timeMax, note=note
    WHERE id=flowerID;
END; //
DELIMITER ;


#									Delete procedures									#

DROP PROCEDURE IF EXISTS CMPendRose.DeleteFlower;
DELIMITER //
CREATE PROCEDURE CMPendRose.DeleteFlower
	(IN flowerID NCHAR(10))
BEGIN
    CALL CMPendRose.DeleteFlowerPests(flowerID);
    CALL CMPendRose.DeleteFlowerOrigin(flowerID);
    CALL CMPendRose.DeleteFlowerColor(flowerID);
    CALL CMPendRose.DeleteFlowerImage(flowerID);
    CALL CMPendRose.DeleteFlowerGrowth(flowerID);
    CALL CMPendRose.DeleteFlowerId(flowerID);
    
    DELETE FROM CMPendRose.FlowerTechInfo WHERE flower=flowerID;
    DELETE FROM CMPendRose.Flower WHERE id=flowerID;
END; //
DELIMITER ;

DROP PROCEDURE IF EXISTS CMPendRose.DeleteFlowerOrigin;
DELIMITER //
CREATE PROCEDURE CMPendRose.DeleteFlowerOrigin
	(IN flowerID NCHAR(10))
BEGIN
    DELETE FROM CMPendRose.FlowerOrigin WHERE flower=flowerID;
    DELETE FROM CMPendRose.Origin WHERE id NOT IN (SELECT origin FROM CMPendRose.FlowerOrigin);
END; //
DELIMITER ;

DROP PROCEDURE IF EXISTS CMPendRose.DeleteFlowerColor;
DELIMITER //
CREATE PROCEDURE CMPendRose.DeleteFlowerColor
	(IN flowerID NCHAR(10))
BEGIN
    DELETE FROM CMPendRose.FlowerColor WHERE flower=flowerID;
    DELETE FROM CMPendRose.Color WHERE id NOT IN (SELECT color FROM CMPendRose.FlowerColor);
END; //
DELIMITER ;

DROP PROCEDURE IF EXISTS CMPendRose.DeleteFlowerPests;
DELIMITER //
CREATE PROCEDURE CMPendRose.DeleteFlowerPests
	(IN flowerID NCHAR(10))
BEGIN
    DELETE FROM CMPendRose.FlowerPests WHERE flower=flowerID;
END; //
DELIMITER ;

DROP PROCEDURE IF EXISTS CMPendRose.DeleteFlowerTechInfo;
DELIMITER //
CREATE PROCEDURE CMPendRose.DeleteFlowerTechInfo
	(IN flowerID NCHAR(10))
BEGIN
    DELETE FROM CMPendRose.FlowerTechInfo WHERE flower=flowerID;
END; //
DELIMITER ;

DROP PROCEDURE IF EXISTS CMPendRose.DeleteFlowerImage;
DELIMITER //
CREATE PROCEDURE CMPendRose.DeleteFlowerImage
	(IN flowerID NCHAR(10))
BEGIN
    DELETE FROM CMPendRose.FlowerImage WHERE flower=flowerID;
END; //
DELIMITER ;

DROP PROCEDURE IF EXISTS CMPendRose.DeleteFlowerGrowth;
DELIMITER //
CREATE PROCEDURE CMPendRose.DeleteFlowerGrowth
	(IN flowerID NCHAR(10))
BEGIN
    DELETE FROM CMPendRose.FlowerGrowth WHERE flower=flowerID;
END; //
DELIMITER ;

DROP PROCEDURE IF EXISTS CMPendRose.DeleteFlowerId;
DELIMITER //
CREATE PROCEDURE CMPendRose.DeleteFlowerId
	(IN flowerID NCHAR(10))
BEGIN
    DELETE FROM CMPendRose.FlowerId WHERE flower=flowerID;
END; //
DELIMITER ;

DROP PROCEDURE IF EXISTS CMPendRose.AcceptFlower;
DELIMITER //
CREATE PROCEDURE CMPendRose.AcceptFlower
	(IN flowerID NCHAR(10))
BEGIN
	START TRANSACTION;
	# Flower
	SELECT @definedId:=fid.definedId, @name:=f.name, @sciname:=sciname, @typeName:=t.name, @heightMin:=heightMin, @heightMax:=heightMax,
	   @widthMin:=widthMin, @widthMax:=widthMax, @fragrance:=fragrance, @petal:=petal, @numPetals:=numPetals,
       @diameterMin:=diameterMin, @diameterMax:=diameterMax, @bloom:=bloom, @tolerance:=tolerance, @timeMin:=timeMin, @timeMax:=timeMax, @note:=note
	FROM CMPendRose.Flower f JOIN CMPendRose.Type t ON (f.id=flowerID AND f.type=t.id) JOIN CMPendRose.FlowerId fid ON fid.flower=f.id;
    SET @id=0;
	CALL CMRose.InsertFlower(@id, @definedId, @name, @sciname, @typeName, @heightMin, @heightMax, @widthMin, @widthMax, @fragrance, @petal, @numPetals,
					  @diameterMin, @diameterMax, @bloom, @tolerance, @timeMin, @timeMax, @note);
	CALL CMRose.DeleteFlower(flowerID);
    DELETE FROM CMRose.FlowerId WHERE flower=@id;
    UPDATE CMRose.Flower SET id=flowerID WHERE id=@id;
    INSERT INTO CMRose.FlowerId VALUES(flowerID, @definedId);
    SET @id=flowerID;
    
    # Origin
    INSERT INTO CMRose.Origin (name) SELECT name FROM CMPendRose.Origin WHERE
							id IN (SELECT origin FROM CMPendRose.FlowerOrigin WHERE flower=flowerID)
                            AND name NOT IN (SELECT name FROM CMRose.Origin);
    INSERT INTO CMRose.FlowerOrigin SELECT @id, ro.id, fo.year FROM CMPendRose.FlowerOrigin fo
							JOIN CMPendRose.Origin peo ON fo.flower=flowerID AND fo.origin=peo.id
                            JOIN CMRose.Origin ro ON ro.name=peo.name;
    
    # Color
    INSERT INTO CMRose.Color (name, hex) SELECT name, hex FROM CMPendRose.Color WHERE
							id IN (SELECT color FROM CMPendRose.FlowerColor WHERE flower=flowerID)
                            AND name NOT IN (SELECT name FROM CMRose.Color);
    INSERT INTO CMRose.FlowerColor SELECT @id, rc.id FROM CMPendRose.FlowerColor fc
							JOIN CMPendRose.Color pec ON fc.flower=flowerID AND fc.color=pec.id
                            JOIN CMRose.Color rc ON rc.name=pec.name;
    
    # Pests
    INSERT INTO CMRose.Pests (name, agent, sign, solution) SELECT name, agent, sign, solution FROM CMPendRose.Pests WHERE
							id IN (SELECT pests FROM CMPendRose.FlowerPests WHERE flower=flowerID)
                            AND name NOT IN (SELECT name FROM CMRose.Pests);
    INSERT INTO CMRose.FlowerPests SELECT @id, rp.id FROM CMPendRose.FlowerPests fp
							JOIN CMPendRose.Pests pep ON fp.flower=flowerID AND fp.pests=pep.id
                            JOIN CMRose.Pests rp ON rp.name=pep.name;
                            
	# TechInfo
    INSERT INTO CMRose.FlowerTechInfo SELECT @id, age, moisMin, moisMax, tempMin, tempMax, pHMin, pHMax, ECMin, ECMax, solarMin, solarMax
							FROM CMPendRose.FlowerTechInfo WHERE flower=flowerID;
    
    # Image
    INSERT INTO CMRose.FlowerImage SELECT @id, numImgs, main FROM CMPendRose.FlowerImage WHERE flower=flowerID;
    
    # Growth
    INSERT INTO CMRose.FlowerGrowth SELECT @id, age, tolerance, height, width, budTime, numBuds, flowerTime, numFlowers, diameter, numPetals, fragrance
							FROM CMPendRose.FlowerGrowth WHERE flower=flowerID;
    
    CALL CMPendRose.DeleteFlower(@id);
    COMMIT;
END; //
DELIMITER ;

DROP PROCEDURE IF EXISTS CMPendRose.GetFlowersList;
DELIMITER //
CREATE PROCEDURE CMPendRose.GetFlowersList
	()
BEGIN
    SELECT f.id, f.name, f.sciname, t.name as type, CONCAT_WS("-", f.id, fi.main) as imgsrc, fi.numImgs, fid.definedId
    FROM CMPendRose.Flower f 
	JOIN CMPendRose.Type t ON f.type=t.id
    LEFT JOIN CMPendRose.FlowerImage fi ON fi.flower=f.id
    JOIN CMPendRose.FlowerId fid ON fid.flower=f.id;
END; //
DELIMITER ;


INSERT INTO CMPendRose.Type (name) VALUES ("Chưa biết");

SELECT * FROM CMRose.Flower;
SELECT * FROM CMPendRose.Flower;

#UPDATE CMPendRose.Flower SET id="d4795e95b2" WHERE id="3c518b00de";

#CALL CMPendRose.AcceptFlower('d4795e95b2');


#CALL CMPendRose.AcceptFlower("80ff5a0314");


#INSERT INTO CMPendRose.Flower SELECT * FROM CMRose.Flower WHERE id="7a4631d05f";

SELECT * FROM CMPendRose.Type;
SELECT * FROM CMPendRose.Color;
SELECT * FROM CMPendRose.Origin;
SELECT * FROM CMPendRose.Pests;
SELECT * FROM CMPendRose.Flower;
SELECT * FROM CMPendRose.FlowerColor;
SELECT * FROM CMPendRose.FlowerOrigin;
SELECT * FROM CMPendRose.FlowerPests;
SELECT * FROM CMPendRose.FlowerTechInfo;
SELECT * FROM CMPendRose.FlowerImage;
SELECT * FROM CMPendRose.FlowerGrowth;
SELECT * FROM CMPendRose.FlowerId;
