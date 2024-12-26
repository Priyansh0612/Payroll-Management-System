-- Create Database
CREATE DATABASE TVSeriesTracker;
USE TVSeriesTracker;

-- Series Table
CREATE TABLE Series (
    SeriesID INT AUTO_INCREMENT PRIMARY KEY,  
    SeriesTitle VARCHAR(100) NOT NULL,               
    SeriesGenre VARCHAR(50),                          
    ReleasedYear INT                           
);

-- Episodes Table
CREATE TABLE Episodes (
    EpisodeID INT AUTO_INCREMENT PRIMARY KEY,  
    SeriesID INT,                              
    EpisodeTitle VARCHAR(100) NOT NULL,                
    SeasonNumber INT,                          
    EpisodeSequence INT,                         
    FOREIGN KEY (SeriesID) REFERENCES Series(SeriesID) 
);

-- Actors Table
CREATE TABLE Actors (
    ActorID INT AUTO_INCREMENT PRIMARY KEY,     
    ActorName VARCHAR(100) NOT NULL,                  
    YearOfBirth INT,                              
    TotalAwards INT                              
);

-- Characters Table
CREATE TABLE Characters (
    CharacterID INT AUTO_INCREMENT PRIMARY KEY, 
    CharacterName VARCHAR(100) NOT NULL,        
    SeriesID INT,                               
    ActorID INT,                                
    FOREIGN KEY (SeriesID) REFERENCES Series(SeriesID), 
    FOREIGN KEY (ActorID) REFERENCES Actors(ActorID)    
);

-- Inserting into Series table
INSERT INTO Series (SeriesTitle, SeriesGenre, ReleasedYear) VALUES
('Lucifer', 'Drama', 2016),
('Stranger Things', 'Sci-Fi', 2016),
('Breaking Bad', 'Crime', 2008),
('Lost in Space', 'Sci-Fi', 2018),
('Suits', 'Drama', 2011);

-- Inserting episodes for each series
INSERT INTO Episodes (SeriesID, EpisodeTitle, SeasonNumber, EpisodeSequence) VALUES 
(1, 'The Sin Bin', 1, 3),
(1, 'Stolen Memories', 1, 4),
(2, 'The Mind Flayer', 1, 3),
(2, 'The Battle of Starcourt', 1, 4),
(3, 'The Cat\'s in the Bag', 1, 2),
(3, 'Say My Name', 1, 3),
(4, 'The New World', 1, 2),
(4, 'The Vanishing', 1, 3),
(5, 'The Choice', 1, 2),
(5, 'The Greater Good', 1, 3);

-- Inserting into Actors table
INSERT INTO Actors (ActorName, YearOfBirth, TotalAwards) VALUES
('Tom Ellis', 1978, 5),
('Millie Bobby Brown', 2004, 3),
('Bryan Cranston', 1956, 16),
('Molly Parker', 1972, 2),
('Gabriel Macht', 1972, 4);

-- Inserting into Characters table
INSERT INTO Characters (CharacterName, SeriesID, ActorID) VALUES
('Lucifer Morningstar', 1, 1), 
('Eleven', 2, 2),                
('Walter White', 3, 3),          
('Maureen Robinson', 4, 4),      
('Harvey Specter', 5, 5); 

-- Select all records from each table
SELECT * FROM Series;           
SELECT * FROM Episodes;         
SELECT * FROM Actors;           
SELECT * FROM Characters;       

-- Mathematical Operations
SELECT MIN(ReleasedYear) AS EarliestSeriesYear FROM Series;  
SELECT SUM(EpisodeSequence) AS TotalEpisodes FROM Episodes;     

-- Join Operation
SELECT Episodes.EpisodeTitle AS EpisodeTitle, Series.SeriesTitle AS SeriesTitle
FROM Episodes
INNER JOIN Series ON Episodes.SeriesID = Series.SeriesID;  

-- Aggregation Queries
SELECT COUNT(EpisodeID) AS TotalEpisodes FROM Episodes;  
SELECT MAX(TotalAwards) AS MaxAwards FROM Actors;        

-- Subqueries
-- Find series titles with characters played by the most awarded actors
SELECT SeriesTitle AS SeriesName
FROM Series
WHERE SeriesID IN 
(
    SELECT SeriesID
    FROM Characters
    WHERE ActorID IN 
    (
        SELECT ActorID
        FROM Actors
        WHERE TotalAwards = (SELECT MAX(TotalAwards) FROM Actors)
    )
);

-- Find series titles that have characters played by actors born before 1975
SELECT SeriesTitle AS SeriesName 
FROM Series 
WHERE SeriesID IN (
    SELECT SeriesID 
    FROM Characters
    WHERE ActorID IN (
        SELECT ActorID 
        FROM Actors 
        WHERE YearOfBirth < 1975
    )
);

-- Find the title of the series with the highest number of episodes
SELECT SeriesTitle AS SeriesName 
FROM Series 
WHERE SeriesID = (
    SELECT SeriesID 
    FROM Episodes 
    GROUP BY SeriesID 
    ORDER BY COUNT(EpisodeID) DESC 
    LIMIT 1
);

-- LIKE Operations
SELECT * FROM Episodes WHERE EpisodeTitle LIKE '%The%';  

SELECT * FROM Characters WHERE CharacterName LIKE '%Walter%';  

-- Cleanup: Drop Tables
DROP TABLE IF EXISTS Characters;  
DROP TABLE IF EXISTS Episodes;    
DROP TABLE IF EXISTS Actors;      
DROP TABLE IF EXISTS Series;      
DROP DATABASE IF EXISTS TVSeriesTracker; 

-- Cleanup: Optional, truncate tables before dropping (not typically needed with DROP)
TRUNCATE TABLE Characters;  
TRUNCATE TABLE Episodes;    
TRUNCATE TABLE Actors;      
TRUNCATE TABLE Series;        
