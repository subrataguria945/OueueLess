def create_user_table_query():
    return """ CREATE TABLE  IF NOT EXISTS Users
(
    UserID SERIAL PRIMARY KEY,

    FullName VARCHAR(100) NOT NULL,

    Email VARCHAR(255) NOT NULL,

    Phone VARCHAR(15) NULL,

    PasswordHash VARCHAR(255) NULL,

    GoogleID VARCHAR(255) NULL,

    ProfileImage VARCHAR(500) NULL,

    IsEmailVerified BOOLEAN NOT NULL DEFAULT FALSE,

    IsActive BOOLEAN NOT NULL DEFAULT TRUE,

    CreatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UpdatedAt TIMESTAMP NULL,

    CONSTRAINT UQ_Users_Email UNIQUE (Email),

    CONSTRAINT UQ_Users_GoogleID UNIQUE (GoogleID),

    CONSTRAINT CK_Users_FullName
        CHECK (LENGTH(TRIM(FullName)) >= 2),

    CONSTRAINT CK_Users_Email
        CHECK (
            Email LIKE '%_@_%._%'
            AND Email NOT LIKE '% %'
        ),

    CONSTRAINT CK_Users_Phone
        CHECK (
            Phone IS NULL
            OR Phone !~ '[^0-9+]'
        )
);
"""

def create_shop_table_query():
    return """CREATE TABLE  IF NOT EXISTS Shops
(
    ShopID SERIAL PRIMARY KEY,

    OwnerID INTEGER NOT NULL,

    ShopName VARCHAR(150) NOT NULL,

    Description VARCHAR(1000) NULL,

    Address VARCHAR(500) NOT NULL,

    City VARCHAR(100) NOT NULL,

    State VARCHAR(100) NOT NULL,

    Pincode VARCHAR(10) NOT NULL,

    Phone VARCHAR(15) NOT NULL,

    Email VARCHAR(255) NULL,

    IsActive BOOLEAN NOT NULL DEFAULT TRUE,

    CreatedAt TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,

    UpdatedAt TIMESTAMP NULL,

    CONSTRAINT FK_Shops_Users
        FOREIGN KEY (OwnerID)
        REFERENCES Users(UserID),

    CONSTRAINT CK_Shops_Name
        CHECK (LENGTH(TRIM(ShopName)) >= 2),

    CONSTRAINT CK_Shops_Address
        CHECK (LENGTH(TRIM(Address)) >= 5),

    CONSTRAINT CK_Shops_Pincode
        CHECK (
            Pincode ~ '^[0-9]+$'
            AND LENGTH(Pincode) BETWEEN 4 AND 10
        ),

    CONSTRAINT CK_Shops_Phone
        CHECK (
            Phone ~ '^[0-9+]+$'
        ),

    CONSTRAINT CK_Shops_Email
        CHECK (
            Email IS NULL
            OR (
                Email LIKE '%_@_%._%'
                AND Email NOT LIKE '% %'
            )
        )
);"""

# reset password otp table for future use 
# CREATE TABLE PasswordResetOTP
# (
#     OTPID BIGINT IDENTITY(1,1) PRIMARY KEY,

#     UserID INT NOT NULL,

#     OTPHash NVARCHAR(255) NOT NULL,

#     ExpiresAt DATETIME2 NOT NULL,

#     IsUsed BIT NOT NULL DEFAULT 0,

#     CreatedAt DATETIME2 NOT NULL DEFAULT SYSDATETIME(),

#     CONSTRAINT FK_PasswordResetOTP_Users
#         FOREIGN KEY (UserID)
#         REFERENCES Users(UserID)
# );