-- drop the existing datatable if it exists
-- before trying to create the table
DROP TABLE inquiries;

-- create the new table
CREATE TABLE inquiries
(
ID int NOT NULL AUTO_INCREMENT,
firstName VARCHAR(255) NOT NULL,
lastName VARCHAR(255) NOT NULL,
email VARCHAR(255) NOT NULL,
managment INT,
marketing INT,
general INT,
economics INT,
PRIMARY KEY(id)
);