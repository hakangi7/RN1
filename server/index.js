const express = require('express');
const jwt = require('jsonwebtoken');
const bcrypt = require('bcryptjs');
const bodyParser = require('body-parser');
//const mariadb = require('mariadb');
//const mysql = require('mysql'); // Use 'mysql2/promise' to use the promise-based API
const mysql = require('mysql2/promise');
const util = require('util');
const nodemailer = require('nodemailer');
const sharp = require('sharp');
const cors = require('cors');
const multer = require('multer');
const path = require('path');
const e = require('express');
const fs = require('fs');
const app = express();

// Add middleware to parse JSON request bodies
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Set up CORS to allow requests from the frontend
app.use(cors());

// Serve static files from the upload directory
app.use('/EventImg', express.static('EventImg'));
app.use('/uploadApple', express.static('uploadApple'));
app.use('/uploadAppleThumnail', express.static(  'uploadAppleThumnail'));



 const pool = mysql.createPool({
  host: '',
  user: '',
  password: '',
  database: '',
  waitForConnections: true,
  connectionLimit: 10,
  queueLimit: 0,
  insecureAuth: true, // Allow connecting to servers with old (insecure) password encryption
});



// JWT secret key
const SECRET_KEY = ''; // Keep this secret and secure


const admin = require('firebase-admin');
const serviceAccount = require(''); // Update with your JSON path

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount),
  
});


const sendMessage = async (deviceToken, title, body) => {
  try {
    const message = {
      notification: {
        title: title,
        body: body,
      },
      token: deviceToken,
    };

    const response = await admin.messaging().send(message);
    console2.log('Successfully sent message:', response);
  } catch (error) {
    console.error('Error sending message:', error);
  }
};



app.post('/updateGoing',  async (req, res) => {
  console2.log("updateGoing req : " , req.body   );
  const { productId , state2   } = req.body;
 
  if (!productId ) {
    return res.status(400).json({ error: 'Missing required fields updateGoing' });
  }

  let conn;
  try {

    conn = await pool.getConnection();

    const updateGoingQuery = {
      query: `update products set going = ? where id = ? `,
      params: [ state2 , productId  ],
    };

    // Define all queries in the transaction
    const transactionQueries = [ updateGoingQuery ];

    // Execute transaction
    await executeTransaction(transactionQueries);

    res.status(200).json({ message: 'update member varify' });



  } catch (err) {
    console2.log('Error during update token :', err);
    res.status(500).json({ error: 'An error occurred while update member varify ' });
  }finally {
    if (conn) conn.release(); // Release the connection
  }


});


app.post('/delAccount',  async (req, res) => {
  console2.log("delAccount req : " , req.body   );
  const { email    } = req.body;
 
  if (!email ) {
    return res.status(400).json({ error: 'Missing required fields delAccount' });
  }

  let conn;
  try {

    conn = await pool.getConnection();

    const updateMemQuery = {
      query: `update members set is_email_verified = 2 where email = ? `,
      params: [ email  ],
    };

    // Define all queries in the transaction
    const transactionQueries = [ updateMemQuery ];

    // Execute transaction
    await executeTransaction(transactionQueries);

    res.status(200).json({ message: 'update member varify' });



  } catch (err) {
    console2.log('Error during update token :', err);
    res.status(500).json({ error: 'An error occurred while update member varify ' });
  }finally {
    if (conn) conn.release(); // Release the connection
  }


});



app.post('/myInfo',  async (req, res) => {
  console2.log("myInfo req : " , req.body   );
  const { email  } = req.body;
 
  if ( !email ) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  let conn;
  try {

    conn = await pool.getConnection();
    
     const myUploaded = await selectQueryParam('select p.id ,  p.name , p.year2 , c.name cname , p.going ,  ' +
                ' date_format( p.created_at , \'%Y-%m-%d\'  ) date2   from products p , categories c ' + 
                ' where p.category_id = c.id and email=? ', [email]);
 
    console2.log( 'myUploaded' , myUploaded  );

    //const mi = myInfo[0];
  
    res.status(200).json({     myUploaded : myUploaded });
 
  } catch (err) {
    console2.log('Error during send msg :', err);
    res.status(500).json({ error: 'An error occurred while sending msg' });
  }finally {
    if (conn) conn.release(); // Release the connection
  }


});


app.post('/sendMsg',  async (req, res) => {
  console2.log("sendMsg req : " , req.body   );
  const { to  , from, msg , productID  } = req.body;
 
  if (!to ||  !msg || !productID ) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  let conn;
  try {

    conn = await pool.getConnection();

    const insertMsgQuery = {
      query: `INSERT INTO  msgs  ( to2, from2, product_id , msg  ) VALUES ( ?, ?, ?, ?)`,
      params: [to , from , parseInt(productID)  , msg ],
    };

    // Define all queries in the transaction
    const transactionQueries = [ insertMsgQuery ];

    // Execute transaction
    await executeTransaction(transactionQueries);

    const users = await selectQueryParam('SELECT * FROM members WHERE email = ? and is_email_verified=1 ', [to]);

    console2.log( 'users' , users  );

    const user = users[0];

    console2.log( 'user token ' ,   user.fcm_token  );
    
    sendMessage( user.fcm_token , 'AppleUsed Message', msg );


    res.status(200).json({ message: 'Message Send to Seller Success!!' });



  } catch (err) {
    console2.log('Error during send msg :', err);
    res.status(500).json({ error: 'An error occurred while sending msg' });
  }finally {
    if (conn) conn.release(); // Release the connection
  }


});


app.post('/updateFCM',  async (req, res) => {
  console2.log("updateFcm req : " , req.body   );
  const { email , token  } = req.body;
 
  if (!email || !token ) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  let conn;
  try {

    conn = await pool.getConnection();

    const updateFcmQuery = {
      query: `update members set fcm_token = ? where email = ? `,
      params: [token , email  ],
    };

    // Define all queries in the transaction
    const transactionQueries = [ updateFcmQuery ];

    // Execute transaction
    await executeTransaction(transactionQueries);

    res.status(200).json({ message: 'update fcm token' });



  } catch (err) {
    console2.log('Error during update token :', err);
    res.status(500).json({ error: 'An error occurred while update token ' });
  }finally {
    if (conn) conn.release(); // Release the connection
  }


});

 
// Route to fetch categories
const selectQuery = async(query) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const [rows] = await conn.query(query);
    return rows;
  } catch (error) {
    console.error('Error object:', JSON.stringify(error, null, 2));
    console.error('Error stack:', error.stack);
    throw error; // Re-throw the error to be handled by the calling function
  } finally {
    if (conn) conn.release();
  }
};

const selectQueryParam = async (query, params) => {
  let conn;
  try {
    conn = await pool.getConnection();
    const [rows] = await conn.query(query, params);
    return rows;
  } catch (error) {
    console.error('Error object:', JSON.stringify(error, null, 2));
    console.error('Error stack:', error.stack);
    throw error; // Re-throw the error to be handled by the calling function
  } finally {
    if (conn) conn.release();
  }
};


const executeTransaction = async (queries) => {
  let conn;
  try {
    conn = await pool.getConnection();
    await conn.beginTransaction(); // Start transaction

    for (let { query, params } of queries) {
      await conn.query(query, params);
    }

    await conn.commit(); // Commit transaction
    return { success: true };
  } catch (error) {
    if (conn) {
      await conn.rollback(); // Rollback transaction on error
    }
    throw error; // Re-throw error to handle in the calling function
  } finally {
    if (conn) conn.release(); // Release the connection
  }
};


// Multer configuration for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, 'uploadApple/'); // Set the directory where files will be saved
  },
  filename: (req, file, cb) => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0'); // Months are 0-based, so add 1
    const day = String(now.getDate()).padStart(2, '0');
    const hour = String(now.getHours()).padStart(2, '0');
    const minute = String(now.getMinutes()).padStart(2, '0');
    const second = String(now.getSeconds()).padStart(2, '0');
    const millisecond = String(now.getMilliseconds()).padStart(3, '0'); // Ensure three digits for milliseconds
    const uniqueSuffix = `${year}${month}${day}_${hour}${minute}${second}_${millisecond}`;
    
    cb(null, uniqueSuffix + path.extname(file.originalname)); // Generate a unique filename with the original file extension
  } 
});

const upload = multer({ storage: storage });




// Route to upload products with photos
app.post('/upload', upload.array('photos', 6), async (req, res) => {

  console2.log("upload req : " , req.body   );

  const { email, productName, description, price, categoryId, titlePhotoIndex, url, address, latitude, longitude , year2 } = req.body;
  const files = req.files;

  if (!productName || !price || !files || files.length === 0 || titlePhotoIndex === undefined  || year2 === undefined  
    || !email || !address || latitude === undefined || longitude === undefined ) {
    return res.status(400).json({ error: 'Missing required fields' });
  }

  let conn;
  try {

    conn = await pool.getConnection();
    
    const titleIndex = parseInt(titlePhotoIndex);
    
    // Prepare the product insert query
    console2.log( ' upload 1 '  );
    const insertProductQuery = {
      query: 'INSERT INTO products (email, name, description, price, category_id, address, latitude, longitude , year2 ) VALUES (?, ?, ?, ?, ?, ?, ?, ?,?)',
      params: [email, productName, description, Number( price ) , parseInt( categoryId ) , address, latitude, longitude , parseInt( year2 ) ],
    };

    const [insertProductResult] = await conn.query(insertProductQuery.query, insertProductQuery.params);
    const productId = insertProductResult.insertId; // Capture the productId



    // Prepare the product photos insert queries
    const photoInserts = files.map((file, index) => [
      productId , // Placeholder for productId
      path.basename(file.path) ,
      index === titleIndex ? 1 : 0,
    ]);


     

    const processedFiles = await Promise.all(
      files.map(async (file) => {
        const ext = '.jpg'; // Ensure thumbnails are saved as JPG
        const baseName = path.parse(file.filename).name; // Get filename without extension
        const thumbnailPath = path.join('./uploadAppleThumnail', 'thum_' + baseName + ext);

        // Create a thumbnail using sharp
        await sharp(file.path)
          .resize({ width: 800 }) // Resize to 800px width
          .toFormat('jpeg') // Convert to JPEG format
          .jpeg({ quality: 80 }) // Set JPEG quality
          .toFile(thumbnailPath);

        return {
          original: file.path, // Path to the original file
          thumbnail: thumbnailPath, // Path to the thumbnail
        };
      })
    );





    const placeholders = photoInserts.map(() => `(?, ?, ?)`).join(', ');
    const insertPhotosQuery = {
      query: `INSERT INTO product_photos (product_id, photo_path, is_title) VALUES ${placeholders}`,
      params: photoInserts.flat(),
    };

    // Prepare category update query
    const updateCategoryQuery = {
      query: `UPDATE categories SET hit = hit + 1 WHERE id = ?`,
      params: [categoryId],
    };

    // Prepare category URL insert query
    const insertCategoryUrlQuery = {
      query: `INSERT INTO categories_urls (categories_id, url, email) VALUES (?, ?, ?)`,
      params: [categoryId, url, email],
    };

    // Define all queries in the transaction
    const transactionQueries = [ insertPhotosQuery, updateCategoryQuery, insertCategoryUrlQuery];

    // Execute transaction
    await executeTransaction(transactionQueries);

    res.status(200).json({ message: 'Product uploaded successfully' });
  } catch (err) {
    console2.log('Error during product upload:', err);
    res.status(500).json({ error: 'An error occurred while saving the product' });
  }finally {
    if (conn) conn.release(); // Release the connection
  }
});



// Sign In Route
app.post('/signin', async (req, res) => {
  const { email, password } = req.body;
  try {

    console2.log( 'users1' , email   );

    // Fetch the user by email
    const users = await selectQueryParam('SELECT * FROM members WHERE email = ? and is_email_verified=1 ', [email]);

    console2.log( 'users' , users  );

    const user = users[0];
    if (!user) {
      return res.status(401).json({ message: 'Invalid email or password' });
    }

    // Validate the password
    const isPasswordValid = await bcrypt.compare(password, user.password_hash);
    if (!isPasswordValid) {
      return res.status(401).json({ message: 'Invalid email or password2' });
    }

    // Generate JWT token
    const token = jwt.sign({ email: user.email }, SECRET_KEY, { expiresIn: '30d' });
    res.json({ token, user });
  } catch (err) {
    console.error('Error during signin:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});



app.post('/categories', async (req, res) => {
  try {
    console2.log('Categories:1');
    const rows = await selectQuery('SELECT * FROM categories ORDER BY hit DESC, id ASC');
    //console2.log('Categories:', rows);
    res.json({ result: rows });
  } catch (error) {
    console.error('Failed to fetch categories:', error);
    res.status(500).json({ message: 'Internal Server Error' });
  }
});







// Sign Up Route
app.post('/detail', async (req, res) => {

  console2.log( ' detail :',   req.body   )

  const { id , name , description , photo_path , price , category_name , category_id } = req.body;
  
  try {
    const conn = await pool.getConnection();

    const productId = Number(id);
    const categoryId = Number(category_id);
    const photos2 = await conn.query('select photo_path from product_photos where product_id = ? order by id desc ', [productId]);
    
    console2.log( 'photos::' , photos2 );
    const urls = await conn.query('select * from categories_urls where categories_id = ?  ', [categoryId]);
    
    console2.log( ' detail urls:',   urls   )

    conn.release();

     

    res.status(200).json({ message: 'User created successfully!' , photos : photos2 , urls : urls   });

    
  } catch (err) {
    console.error('Error during signup:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});



// Sign Up Route
app.post('/signup', async (req, res) => {

  console2.log( 'body: ${ req.body } ' )

  const { email, password } = req.body;
  const hashedPassword = await bcrypt.hash(password, 10);
  try {
    const conn = await pool.getConnection();
    await conn.query('INSERT INTO members (email, password_hash) VALUES (?, ?)', [email, hashedPassword]);
    conn.release();

    const token = jwt.sign({ email: email }, SECRET_KEY, { expiresIn: '1d' }); // Token valid for 7 days
    sendMail(email);
    res.status(200).json({ message: 'YouCanUseAfterEamilVerify' , token : token });

    
  } catch (err) {
    console.error('Error during signup:', err);
    res.status(500).json({ message: 'Internal server error' });
  }
});


// Authentication middleware
const authenticateToken = (req, res, next) => {
  // Use the exact case 'Authorization' to fetch the header
  const authHeader = req.headers[''] || req.headers['']; // Check for both lowercase and standard cases
  const token = authHeader && authHeader.split(' ')[1]; // Get the token after 'Bearer '

  if (!token) return res.status(401).json({ message: 'Token not provided' });

  jwt.verify(token, SECRET_KEY, (err, user) => {
    if (err) return res.status(403).json({ message: 'Token is invalid or expired' });

    req.user = user; // Set the user data extracted from the token to req.user
    next();
  });
};


// Auto Login Route
app.post('/autologin', authenticateToken, (req, res) => {
  if (!req.user) {
    // If user is not authenticated
    //console2.log( 'autologin fail ' ,  req    );
    return res.status(401).json({ message: 'Auto Login Failed. User not authenticated.' });
  }
  console2.log( 'autologin success ' ,  req.user    );
  // If user is authenticated
  res.json({ message: 'Auto Login Successful', user: req.user });
});



// Route to fetch products with pagination
app.post('/products', async (req, res) => {
  console2.log( 'products  ' ,  req    );
  const long = req.body.long2;
  const lati = req.body.lati;
  const page = parseInt(req.body.page) || 1;
  const limit = parseInt(req.body.limit) || 10;
  const offset = (page - 1) * limit;

  try {
    const query = `
      SELECT 
          p.id, 
          p.name, 
          p.description, 
          c.description d2 ,
          p.price, 
          p.created_at, 
          c.name AS category_name, 
          c.id AS category_id,
          pp.photo_path ,
          p.year2 , p.address , p.email, p.going , 
          ( 6371 * acos(
            cos(radians(?)) * cos(radians(p.latitude)) * 
            cos(radians(p.longitude) - radians(?)) + 
            sin(radians(?)) * sin(radians(p.latitude))
        )
    ) AS distance
        FROM 
          products p
        LEFT JOIN 
          categories c ON p.category_id = c.id
        LEFT JOIN 
          product_photos pp ON p.id = pp.product_id AND pp.is_title = 1   
        ORDER BY 
          p.id DESC
        LIMIT ? OFFSET ?
      `;
    
    const rows = await selectQueryParam(query, [lati , long , lati , limit, offset]);
    console2.log( 'products::' ,  rows );
    res.status(200).json({ result: rows });
  } catch (err) {
    console.error('Error fetching products:', err);
    res.status(500).json({ error: 'An error occurred while fetching the products' });
  }
});

app.get('/hello', (req, res) => {
  res.json({ message: 'Hello, world!' });
});


const port = 3001; //'0.0.0.0'
app.listen(port, '', () => {
  console2.log(`Backend server running on http://localhost:${port}`);
});


const pingDatabase = async () => {
  try {
    // Get a connection from the pool
    const conn = await pool.getConnection();
    console2.log('Successfully got a connection');

    // Ping the database
    await conn.ping();
    console2.log('Ping successful at', new Date().toLocaleTimeString());

    // Release the connection back to the pool
    conn.release();
  } catch (err) {
    console.error('Error during ping or connection:', err.message);
  }
};


setInterval(pingDatabase, 60000);
 
app.get('/verify', async (req, res) => {
  const {  id } = req.body;
  try {
    const conn = await pool.getConnection();
    await conn.query('update members set is_email_verified=1 where email =? ', [id]);
    conn.release();

    
    res.status(200).json({ message: 'User created successfully!' , token : token });

    
  } catch (err) {
    console.error('Error during signup:', err);
    res.status(500).json({ message: 'Internal server error' });
  }

});
 
const sendMail = async (email) => {

  let transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: {
      user: '', // Your Gmail address
      pass: '',  // Your Gmail password (consider using an App Password for security)
    },
  });
  
  // Setup email data
  let mailOptions = {
    from: '"OrangeUsed" <logicmaker7@gmail.com>', // sender address
    to: email ,          // list of receivers
    subject: 'AppleUsed App email verify',              // Subject line
    //text: '',  // plain text body
    html: '<b> You can use AppleUsed App, after to click under link  </b><br>'
     + "<a href='http://logicmaker.com:3001/verify?id="+ email +"' > Click Me !! for Verify AppleUsed App. </a>"
    , // html body
  };
  
  // Send email
  transporter.sendMail(mailOptions, (error, info) => {
    if (error) {
      return console2.log(error);
    }
    console2.log('Email sent: ' + info.response);
  });
 }

 const console2 = {
  log: (message, isDisplay = false) => {
    if (isDisplay) {
      console.log(message);
    }
  },
};

 
