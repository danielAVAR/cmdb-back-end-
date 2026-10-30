import app from './app.js'

try{
    // Verifica la conexion con MySQL
    const connection = await pool.getConnection();
    connection.release();

    app.listen(PORT, () => {
        console.log(`API ready in http://localhost${PORT}`)
    });
} catch (error){
    console.error('MySQL not connected:', error.message);
    await pool.end();
    process.exit(1);
}