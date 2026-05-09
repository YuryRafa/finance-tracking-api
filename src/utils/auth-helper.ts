import bcrypt from 'bcrypt';

export const hashPassword = async (password: string) =>{
    return await bcrypt.hash(password, 6);

}

export const validatePassword = async(password: string, password_hash: string) => {
    return await bcrypt.compare(password, password_hash);
}