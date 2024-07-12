import connectToDatabase from './config';
import User, { IUser }  from './userscheme';
import { SHA256, enc } from 'crypto-js';
const cipher = require('../app/ciphering');

// const isUserExist = async(username: string, email: string)
const createUser = async (username: string, organisasi: string, email: string, password: string,  tipeUser: string, key:string) => {
    try {
        await connectToDatabase(); // Menghubungkan ke MongoDB

        const existingUser = await User.findOne({ $or: [{ 'username' : username }, { 'email' : email }] });

        console.log(existingUser);
        if (existingUser ) {
            console.error('User with the same username or email already exists');
            var response = {
                success: false,
                message: username + ': User already exists',
                };
                
            return response; // Jika pengguna sudah ada, berhenti dan kembalikan
        }

        const newUser = new User({
            username,
            email,
            password,
            organisasi,
            tipeUser,
            key,
        });
        const savedUser = await newUser.save();
        console.log('User saved successfully:', savedUser)
        var response = {
            success: true,
            message: username + ': User data already saved to database',
            };
            
        return response; 
    } catch (error: any) {
        return error.message;
    }
}

const updateUser = async (username: string, newData: Partial<IUser>)=>{
    try {
        await connectToDatabase();
        const userToUpdate = await User.findOne({ username });
        if (!userToUpdate) {
            console.error('User not found');
            var response = {
                success: false,
                message: username + ': User not found',
                };
                
            return response;
        }
        Object.assign(userToUpdate, newData);
        const updatedUser = await userToUpdate.save();
        console.log('User updated successfully:', updatedUser);

        var response = {
            success: true,
            message: username + ': User has been updated',
            };
            
        return response;
          
    } catch (error: any) {
        console.error('Error updating user:', error);
        return error.message;
    }
}

const deleteUser = async(username: string)=> {
    try {
        await connectToDatabase();

        const userToDelete = await User.findOne({ username });

        if (!userToDelete) {
            console.error('User not found');
            var response = {
                success: false,
                message: username + ': User not found',
                };
                
            return response;
          }
        
        await userToDelete.deleteOne();
        console.log('User deleted successfully');
        var response = {
            success: true,
            message: username + ': User has been deleted',
            };
            
        return response;
    } catch (error:any) {
        console.error('Error deleting user:', error);
        return error.message;
    }
}

const getVerKey = async()=> {
    try {
        await connectToDatabase();

        const user = await User.findOne({ tipeUser: 'verifikator' });

        const keytoMatch = cipher.generateABEKey2Dec(user?.key.toString(),user?.username); //new implementation 
        // console.log(user);
        if (user) {
            // return user.key.toString();
            return keytoMatch;
        } else {
            return null;
        }

    } catch (error:any) {
        console.error('Error verifikator not found:', error);
        return error.message;
    }
}

const getKey = async(id:string) => {
    try {
        await connectToDatabase();

        const user = await User.findOne({ $or: [{ 'username' : id }, { 'email' : id }] });
        
        if (user!=null) {
            console.log('user key =',user.key.toString());
            return user.key.toString();
        } else {
            return null;
        }

    } catch (error:any) {
        console.error('Error user not found:', error);
        return error.message;
    }
}

const getUser = async (id:string) =>{
    try {
        await connectToDatabase();
        const user = await User.findOne({ $or: [{ 'username' : id }, { 'email' : id }] });
        return user;
    } catch (error:any) {
        console.error('Error user not found:', error);
        return error.message;
    }
}
exports.createUser = createUser;
exports.updateUser = updateUser;
exports.deleteUser = deleteUser;
exports.getVerKey = getVerKey;
exports.getKey = getKey;
exports.getUser = getUser;