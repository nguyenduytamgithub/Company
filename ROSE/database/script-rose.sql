CREATE DATABASE IF NOT EXISTS CMRose;
SET SQL_SAFE_UPDATES = 0;


#########################################################################################
#										CREATE TABLES									#
#########################################################################################

CREATE TABLE IF NOT EXISTS CMRose.Pests (
	id			INT					NOT NULL AUTO_INCREMENT,
    name		NVARCHAR(50),
    agent		NVARCHAR(150),
    sign		NVARCHAR(150),
    solution	NVARCHAR(150),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS CMRose.Type (
	id			INT					NOT NULL AUTO_INCREMENT,
	name		NVARCHAR(50),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS CMRose.Color (
	id			INT					NOT NULL AUTO_INCREMENT,
    name		NVARCHAR(50),
    hex			NCHAR(20),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS CMRose.Origin (
	id			INT					NOT NULL AUTO_INCREMENT,
    name		NCHAR(50),
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS CMRose.Flower (
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
    FOREIGN KEY (type) REFERENCES CMRose.Type(id)
);

CREATE TABLE IF NOT EXISTS CMRose.FlowerTechInfo (
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
    FOREIGN KEY (flower) REFERENCES CMRose.Flower(id)
);

CREATE TABLE IF NOT EXISTS CMRose.FlowerOrigin (
	flower		NCHAR(10)			NOT NULL,
    origin		INT					NOT NULL,
    year		INT,
    PRIMARY KEY (flower, origin),
    FOREIGN KEY (flower) REFERENCES CMRose.Flower(id),
    FOREIGN KEY (origin) REFERENCES CMRose.Origin(id)
);

CREATE TABLE IF NOT EXISTS CMRose.FlowerColor (
	flower		NCHAR(10)			NOT NULL,
    color		INT					NOT NULL,
    PRIMARY KEY (flower, color),
    FOREIGN KEY (flower) REFERENCES CMRose.Flower(id),
    FOREIGN KEY (color) REFERENCES CMRose.Color(id)
);

CREATE TABLE IF NOT EXISTS CMRose.FlowerPests (
	flower		NCHAR(10)			NOT NULL,
    pests		INT					NOT NULL,
    PRIMARY KEY (flower, pests),
    FOREIGN KEY (flower) REFERENCES CMRose.Flower(id),
    FOREIGN KEY (pests) REFERENCES CMRose.Pests(id)
);

CREATE TABLE IF NOT EXISTS CMRose.FlowerImage (
	flower		NCHAR(10)			NOT NULL,
    numImgs		INT					DEFAULT 0,
    main		INT					DEFAULT 0,
    PRIMARY KEY (flower),
    FOREIGN KEY (flower) REFERENCES CMRose.Flower(id)
);

CREATE TABLE IF NOT EXISTS CMRose.FlowerGrowth (
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
    FOREIGN KEY (flower) REFERENCES CMRose.Flower(id)
);

CREATE TABLE IF NOT EXISTS CMRose.FlowerId (
	flower		NCHAR(10)			NOT NULL,
    definedId	NCHAR(50),							# id do người dùng định nghĩa
    PRIMARY KEY (flower),
    FOREIGN KEY (flower) REFERENCES CMRose.Flower(id)
);

CREATE TABLE IF NOT EXISTS CMRose.Pot (
	id			NCHAR(10)			NOT NULL,
    flower		NCHAR(10),
    mois		DOUBLE,								# độ ẩm chất trồng
    temp		DOUBLE,								# nhiệt độ chất trồng
    pH			DOUBLE,
    EC			DOUBLE,
    solar		DOUBLE,								# cường độ ánh sáng
    PRIMARY KEY (id),
    FOREIGN KEY (flower) REFERENCES CMRose.Flower(id)
);

CREATE TABLE IF NOT EXISTS CMRose.Plot (
	id			NCHAR(10)			NOT NULL,
    temp		DOUBLE,								# nhiệt độ không khí
    hum			DOUBLE,								# độ ẩm không khí
    solar		DOUBLE,								# cường độ ánh sáng
    PRIMARY KEY (id)
);

CREATE TABLE IF NOT EXISTS CMRose.AccPlot (
	plot		NCHAR(10)			NOT NULL,
    tempMin		DOUBLE				DEFAULT 0.0,	# nhiệt độ không khí
    tempMax		DOUBLE				DEFAULT 0.0,
    humMin		DOUBLE				DEFAULT 0.0,	# độ ẩm không khí
    humMax		DOUBLE				DEFAULT 0.0,
    solarMin	DOUBLE				DEFAULT 0.0,	# cường độ ánh sáng
    solarMax	DOUBLE				DEFAULT 0.0,
    PRIMARY KEY (plot),
    FOREIGN KEY (plot) REFERENCES CMRose.Plot(id)
);

CREATE TABLE IF NOT EXISTS CMRose.PlotPot (
	plot		NCHAR(10)			NOT NULL,
    pot			NCHAR(10)			NOT NULL,
    PRIMARY KEY (plot, pot),
    FOREIGN KEY (plot) REFERENCES CMRose.Plot(id),
    FOREIGN KEY (pot) REFERENCES CMRose.Pot(id)
);


#########################################################################################
#									CREATE FUNCTIONS									#
#########################################################################################

DROP FUNCTION IF EXISTS CMRose.CheckIDFlower;
DELIMITER //
CREATE FUNCTION CMRose.CheckIDFlower
	(id NCHAR(10))
	RETURNS BOOL
BEGIN
	IF NOT TRUE
    THEN RETURN FALSE;
    END IF;
    RETURN TRUE;
END; //
DELIMITER ;

DROP FUNCTION IF EXISTS CMRose.CheckIDPot;
DELIMITER //
CREATE FUNCTION CMRose.CheckIDPot
	(id NCHAR(10))
	RETURNS BOOL
BEGIN
	IF NOT TRUE
    THEN RETURN FALSE;
    END IF;
    RETURN TRUE;
END; //
DELIMITER ;

DROP FUNCTION IF EXISTS CMRose.CheckIDPlot;
DELIMITER //
CREATE FUNCTION CMRose.CheckIDPlot
	(id NCHAR(10))
	RETURNS BOOL
BEGIN
	IF NOT TRUE
    THEN RETURN FALSE;
    END IF;
    RETURN TRUE;
END; //
DELIMITER ;

DROP FUNCTION IF EXISTS CMRose.CreateIDFlower;
DELIMITER //
CREATE FUNCTION CMRose.CreateIDFlower
	()
	RETURNS TEXT
BEGIN
	SET @name=(SELECT SUBSTR(CONCAT(MD5(RAND()),MD5(RAND())),1,10));
    RETURN @name;
END; //
DELIMITER ;

DROP FUNCTION IF EXISTS CMRose.CreateIDPot;
DELIMITER //
CREATE FUNCTION CMRose.CreateIDPot
	()
	RETURNS TEXT
BEGIN
	SET @name=(SELECT SUBSTR(CONCAT(MD5(RAND()),MD5(RAND())),1,10));
    RETURN @name;
END; //
DELIMITER ;

DROP FUNCTION IF EXISTS CMRose.CreateIDPlot;
DELIMITER //
CREATE FUNCTION CMRose.CreateIDPlot
	()
	RETURNS TEXT
BEGIN
	SET @name=(SELECT SUBSTR(CONCAT(MD5(RAND()),MD5(RAND())),1,10));
    RETURN @name;
END; //
DELIMITER ;

DROP FUNCTION IF EXISTS CMRose.GetIDType;
DELIMITER //
CREATE FUNCTION CMRose.GetIDType
	(typeName NCHAR(50))
	RETURNS INT
BEGIN
    RETURN (SELECT id FROM CMRose.Type WHERE name=typeName);
END; //
DELIMITER ;

DROP FUNCTION IF EXISTS CMRose.GetIDColor;
DELIMITER //
CREATE FUNCTION CMRose.GetIDColor
	(colorName NCHAR(50))
	RETURNS INT
BEGIN
    RETURN (SELECT id FROM CMRose.Color WHERE name=colorName);
END; //
DELIMITER ;

DROP FUNCTION IF EXISTS CMRose.GetIDOrigin;
DELIMITER //
CREATE FUNCTION CMRose.GetIDOrigin
	(originName NCHAR(50))
	RETURNS INT
BEGIN
    RETURN (SELECT id FROM CMRose.Origin WHERE name=originName);
END; //
DELIMITER ;

DROP FUNCTION IF EXISTS CMRose.GetIDPests;
DELIMITER //
CREATE FUNCTION CMRose.GetIDPests
	(pestsName NCHAR(50))
	RETURNS INT
BEGIN
    RETURN (SELECT id FROM CMRose.Pests WHERE name=pestsName);
END; //
DELIMITER ;

#########################################################################################
#									CREATE TRIGGERS										#
#########################################################################################

DROP TRIGGER IF EXISTS CMRose.InsertFlowerTrigger;
DELIMITER //
CREATE TRIGGER CMRose.InsertFlowerTrigger
BEFORE INSERT on CMRose.Flower
FOR EACH ROW
BEGIN
	IF NOT CMRose.CheckIDFlower(NEW.id)
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

DROP TRIGGER IF EXISTS CMRose.UpdateFlowerTrigger;
DELIMITER //
CREATE TRIGGER CMRose.UpdateFlowerTrigger
BEFORE UPDATE on CMRose.Flower
FOR EACH ROW
BEGIN
	IF NOT CMRose.CheckIDFlower(NEW.id)
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

DROP TRIGGER IF EXISTS CMRose.InsertPotTrigger;
DELIMITER //
CREATE TRIGGER CMRose.InsertPotTrigger
BEFORE INSERT on CMRose.Pot
FOR EACH ROW
BEGIN
	IF NOT CMRose.CheckIDPot(NEW.id)
    THEN
		SIGNAL SQLSTATE '45000'
		SET MESSAGE_TEXT = 'Invalid pot\'s ID';
    END IF;
END; //
DELIMITER ;

DROP TRIGGER IF EXISTS CMRose.InsertPlotTrigger;
DELIMITER //
CREATE TRIGGER CMRose.InsertPlotTrigger
BEFORE INSERT on CMRose.Plot
FOR EACH ROW
BEGIN
	IF NOT CMRose.CheckIDPlot(NEW.id)
    THEN
		SIGNAL SQLSTATE '45000'
		SET MESSAGE_TEXT = 'Invalid plot\'s ID';
    END IF;
END; //
DELIMITER ;


#########################################################################################
#									CREATE PROCEDURES									#
#########################################################################################

#									Insert procedures									#

DROP PROCEDURE IF EXISTS CMRose.InsertFlower;
DELIMITER //
CREATE PROCEDURE CMRose.InsertFlower
	(OUT id NCHAR(10), IN definedId NCHAR(50), IN name NVARCHAR(50), IN sciname NVARCHAR(50), IN typeName NVARCHAR(50), IN heightMin DOUBLE, IN heightMax DOUBLE, IN widthMin DOUBLE, IN widthMax DOUBLE,
     IN fragrance NVARCHAR(150), IN petal NVARCHAR(150), IN numPetals NCHAR(15), IN diameterMin DOUBLE, IN diameterMax DOUBLE,
     IN bloom NVARCHAR(150), IN tolerance DOUBLE, IN timeMin INT, IN timeMax INT, IN note NVARCHAR(150))
BEGIN
	IF typeName != '' THEN
		SET @type = (SELECT CMRose.GetIDType(typeName));
		
		IF @type IS NULL 
		THEN
			INSERT INTO CMRose.Type (name) VALUES(typeName);
			SET @type = (SELECT LAST_INSERT_ID());
		END IF;
	ELSE
		SET @type = NULL;
	END IF;
    
    SET id = (SELECT CMRose.CreateIDFlower());
    
    INSERT INTO CMRose.Flower (id, name, sciname, type, heightMin, heightMax, widthMin, widthMax, fragrance, petal, numPetals, diameterMin, diameterMax, bloom, tolerance, timeMin, timeMax, note)
    VALUES(id, name, sciname, @type, heightMin, heightMax, widthMin, widthMax, fragrance, petal, numPetals, diameterMin, diameterMax, bloom, tolerance, timeMin, timeMax, note);
    
    INSERT INTO CMRose.FlowerId (flower, definedId) VALUES(id, definedId);
    
    SELECT id;
END; //
DELIMITER ;

DROP PROCEDURE IF EXISTS CMRose.InsertFlowerOrigin;
DELIMITER //
CREATE PROCEDURE CMRose.InsertFlowerOrigin
	(IN flower NCHAR(10), IN originName NVARCHAR(50), IN year INT)
BEGIN
    SET @origin = (SELECT CMRose.GetIDOrigin(originName));
    
    IF @origin IS NULL
    THEN
		INSERT INTO CMRose.Origin (name) VALUES(originName);
        SET @origin = (SELECT LAST_INSERT_ID());
    END IF;
    
    INSERT INTO CMRose.FlowerOrigin (flower, origin, year) VALUES (flower, @origin, year);
END; //
DELIMITER ;

DROP PROCEDURE IF EXISTS CMRose.InsertFlowerColor;
DELIMITER //
CREATE PROCEDURE CMRose.InsertFlowerColor
	(IN flower NCHAR(10), IN colorName NVARCHAR(50), IN hex NCHAR(20))
BEGIN
    SET @color = (SELECT CMRose.GetIDColor(colorName));
    
    IF @color IS NULL
    THEN
		INSERT INTO CMRose.Color (name, hex) VALUES(colorName, hex);
        SET @color = (SELECT LAST_INSERT_ID());
    END IF;
    
    INSERT INTO CMRose.FlowerColor (flower, color) VALUES (flower, @color);
END; //
DELIMITER ;

DROP PROCEDURE IF EXISTS CMRose.InsertFlowerPests;
DELIMITER //
CREATE PROCEDURE CMRose.InsertFlowerPests
	(IN flower NCHAR(10), IN pestsName NVARCHAR(50), IN agent NVARCHAR(150),
    IN sign NVARCHAR(150), IN solution NVARCHAR(150))
BEGIN
    SET @pests = (SELECT CMRose.GetIDPests(pestsName));
    
    IF @pests IS NULL
    THEN
		INSERT INTO CMRose.Pests (name, agent, sign, solution) VALUES(pestsName, agent, sign, solution);
        SET @pests = (SELECT LAST_INSERT_ID());
    END IF;
    
    INSERT INTO CMRose.FlowerPests (flower, pests) VALUES (flower, @pests);
END; //
DELIMITER ;

DROP PROCEDURE IF EXISTS CMRose.InsertFlowerTechInfo;
DELIMITER //
CREATE PROCEDURE CMRose.InsertFlowerTechInfo
	(IN flower NCHAR(10), IN age INT, IN moisMin DOUBLE, IN moisMax DOUBLE, IN tempMin DOUBLE, IN tempMax DOUBLE,
    IN pHMin DOUBLE, IN pHMax DOUBLE, IN ECMin DOUBLE, IN ECMax DOUBLE, IN solarMin INT, IN solarMax INT)
BEGIN
    INSERT INTO CMRose.FlowerTechInfo
	(flower, age, moisMin, moisMax, tempMin, tempMax, pHMin, pHMax, ECMin, ECMax, solarMin, solarMax)
	VALUES (flower, age, moisMin, moisMax, tempMin, tempMax, pHMin, pHMax, ECMin, ECMax, solarMin, solarMax);
END; //
DELIMITER ;

DROP PROCEDURE IF EXISTS CMRose.InsertFlowerImage;
DELIMITER //
CREATE PROCEDURE CMRose.InsertFlowerImage
	(IN flower NCHAR(10), IN numImgs INT, IN main INT)
BEGIN
    INSERT INTO CMRose.FlowerImage (flower, numImgs, main) VALUES (flower, numImgs, main);
END; //
DELIMITER ;

DROP PROCEDURE IF EXISTS CMRose.InsertFlowerGrowth;
DELIMITER //
CREATE PROCEDURE CMRose.InsertFlowerGrowth
	(IN flower NCHAR(10), IN age INT, IN tolerance DOUBLE, IN height DOUBLE, IN width DOUBLE, IN budTime INT,
    IN numBuds INT, IN flowerTime INT, IN numFlowers INT, IN diameter DOUBLE, IN numPetals INT, IN fragrance NVARCHAR(150))
BEGIN
    INSERT INTO CMRose.FlowerGrowth
	(flower, age, tolerance, height, width, budTime, numBuds, flowerTime, numFlowers, diameter, numPetals, fragrance)
	VALUES (flower, age, tolerance, height, width, budTime, numBuds, flowerTime, numFlowers, diameter, numPetals, fragrance);
END; //
DELIMITER ;

#									Update procedures									#

DROP PROCEDURE IF EXISTS CMRose.UpdateFlower;
DELIMITER //
CREATE PROCEDURE CMRose.UpdateFlower
	(IN flowerID VARCHAR(10), IN name NVARCHAR(50), IN sciname NVARCHAR(50), IN typeName NVARCHAR(50), IN heightMin DOUBLE, IN heightMax DOUBLE, IN widthMin DOUBLE, IN widthMax DOUBLE,
     IN fragrance NVARCHAR(150), IN petal NVARCHAR(150), IN numPetals NCHAR(15), IN diameterMin DOUBLE, IN diameterMax DOUBLE,
     IN bloom NVARCHAR(150), IN tolerance DOUBLE, IN timeMin INT, IN timeMax INT, IN note NVARCHAR(150))
BEGIN
	SET @type = (SELECT CMRose.GetIDType(typeName));
    
	IF @type IS NULL
    THEN
		INSERT INTO CMRose.Type (name) VALUES(typeName);
        SET @type = (SELECT LAST_INSERT_ID());
    END IF;
    
    UPDATE CMRose.Flower
    SET name=name, sciname=sciname, type=@type, heightMin=heightMin, heightMax=heightMax, widthMin=widthMin, widthMax=widthMax, fragrance=fragrance, petal=petal, numPetals=numPetals, diameterMin=diameterMin, diameterMax=diameterMax, bloom=bloom, tolerance=tolerance, timeMin=timeMin, timeMax=timeMax, note=note
    WHERE id=flowerID;
END; //
DELIMITER ;


#									Delete procedures									#

DROP PROCEDURE IF EXISTS CMRose.CleanUpFlowerPot;
DELIMITER //
CREATE PROCEDURE CMRose.CleanUpFlowerPot
	(IN potID NCHAR(10))
BEGIN
    UPDATE CMRose.Pot SET flower=NULL WHERE pot=potID;
END; //
DELIMITER ;

DROP PROCEDURE IF EXISTS CMRose.DeleteFlower;
DELIMITER //
CREATE PROCEDURE CMRose.DeleteFlower
	(IN flowerID NCHAR(10))
BEGIN
    UPDATE CMRose.Pot SET flower=NULL WHERE flower=flowerID;
    
    CALL CMRose.DeleteFlowerPests(flowerID);
    CALL CMRose.DeleteFlowerOrigin(flowerID);
    CALL CMRose.DeleteFlowerColor(flowerID);
    CALL CMRose.DeleteFlowerImage(flowerID);
    CALL CMRose.DeleteFlowerGrowth(flowerID);
    CALL CMRose.DeleteFlowerId(flowerID);
    
    DELETE FROM CMRose.FlowerTechInfo WHERE flower=flowerID;
    DELETE FROM CMRose.Flower WHERE id=flowerID;
END; //
DELIMITER ;

DROP PROCEDURE IF EXISTS CMRose.DeleteFlowerOrigin;
DELIMITER //
CREATE PROCEDURE CMRose.DeleteFlowerOrigin
	(IN flowerID NCHAR(10))
BEGIN
    DELETE FROM CMRose.FlowerOrigin WHERE flower=flowerID;
    DELETE FROM CMRose.Origin WHERE id NOT IN (SELECT origin FROM CMRose.FlowerOrigin);
END; //
DELIMITER ;

DROP PROCEDURE IF EXISTS CMRose.DeleteFlowerColor;
DELIMITER //
CREATE PROCEDURE CMRose.DeleteFlowerColor
	(IN flowerID NCHAR(10))
BEGIN
    DELETE FROM CMRose.FlowerColor WHERE flower=flowerID;
    DELETE FROM CMRose.Color WHERE id NOT IN (SELECT color FROM CMRose.FlowerColor);
END; //
DELIMITER ;

DROP PROCEDURE IF EXISTS CMRose.DeleteFlowerPests;
DELIMITER //
CREATE PROCEDURE CMRose.DeleteFlowerPests
	(IN flowerID NCHAR(10))
BEGIN
    DELETE FROM CMRose.FlowerPests WHERE flower=flowerID;
END; //
DELIMITER ;

DROP PROCEDURE IF EXISTS CMRose.DeleteFlowerTechInfo;
DELIMITER //
CREATE PROCEDURE CMRose.DeleteFlowerTechInfo
	(IN flowerID NCHAR(10))
BEGIN
    DELETE FROM CMRose.FlowerTechInfo WHERE flower=flowerID;
END; //
DELIMITER ;

DROP PROCEDURE IF EXISTS CMRose.DeleteFlowerImage;
DELIMITER //
CREATE PROCEDURE CMRose.DeleteFlowerImage
	(IN flowerID NCHAR(10))
BEGIN
    DELETE FROM CMRose.FlowerImage WHERE flower=flowerID;
END; //
DELIMITER ;

DROP PROCEDURE IF EXISTS CMRose.DeleteFlowerGrowth;
DELIMITER //
CREATE PROCEDURE CMRose.DeleteFlowerGrowth
	(IN flowerID NCHAR(10))
BEGIN
    DELETE FROM CMRose.FlowerGrowth WHERE flower=flowerID;
END; //
DELIMITER ;

DROP PROCEDURE IF EXISTS CMRose.DeleteFlowerId;
DELIMITER //
CREATE PROCEDURE CMRose.DeleteFlowerId
	(IN flowerID NCHAR(10))
BEGIN
    DELETE FROM CMRose.FlowerId WHERE flower=flowerID;
END; //
DELIMITER ;

DROP PROCEDURE IF EXISTS CMRose.GetFlowersList;
DELIMITER //
CREATE PROCEDURE CMRose.GetFlowersList
	()
BEGIN
    SELECT f.id, f.name, f.sciname, t.name as type, CONCAT_WS("-", f.id, fi.main) as imgsrc, fi.numImgs, fid.definedId
    FROM CMRose.Flower f 
	JOIN CMRose.Type t ON f.type=t.id
    LEFT JOIN CMRose.FlowerImage fi ON fi.flower=f.id
    JOIN CMRose.FlowerId fid ON fid.flower=f.id AND f.id NOT IN (SELECT id FROM CMPendRose.Flower);
END; //
DELIMITER ;

INSERT INTO CMRose.Type (name) VALUES ("Chưa biết");


SELECT * FROM CMRose.Type;
SELECT * FROM CMRose.Color;
SELECT * FROM CMRose.Origin;
SELECT * FROM CMRose.Pests;
SELECT * FROM CMRose.Flower;
SELECT * FROM CMRose.FlowerColor;
SELECT * FROM CMRose.FlowerOrigin;
SELECT * FROM CMRose.FlowerPests;
SELECT * FROM CMRose.FlowerTechInfo;
SELECT * FROM CMRose.FlowerImage;
SELECT * FROM CMRose.FlowerGrowth;
SELECT * FROM CMRose.FlowerId;

SELECT * FROM CMRose.Pot;
SELECT * FROM CMRose.Plot;
SELECT * FROM CMRose.AccPlot;
