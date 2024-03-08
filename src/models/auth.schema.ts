import { sequelize } from '@authentication/database';
import { IAuthDocument } from '@mohamedramadan14/freelance-shared';
import { compare, hash } from 'bcryptjs';
import { DataTypes, Model, ModelDefined, Optional } from 'sequelize';

type AuthUserCreationAttributes = Optional<IAuthDocument, 'id' | 'createdAt' | 'passwordResetToken' | 'passwordResetExpires'>;

const SALT_Rounds = 10;

const AuthModel: ModelDefined<IAuthDocument, AuthUserCreationAttributes> = sequelize.define(
  'auth',
  {
    username: {
      type: DataTypes.STRING,
      allowNull: false
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false
    },
    profilePublicId: {
      type: DataTypes.STRING,
      allowNull: false
    },
    email: {
      type: DataTypes.STRING,
      allowNull: false
    },
    country: {
      type: DataTypes.STRING,
      allowNull: false
    },
    profilePicture: {
      type: DataTypes.STRING,
      allowNull: false
    },
    emailVerificationToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    emailVerified: {
      type: DataTypes.BOOLEAN,
      defaultValue: 0,
      allowNull: false
    },
    createdAt: {
      type: DataTypes.DATE,
      defaultValue: Date.now
    },
    passwordResetToken: {
      type: DataTypes.STRING,
      allowNull: true
    },
    passwordResetExpires: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Date.now
    }
  },
  {
    indexes: [
      { unique: true, fields: ['username'] },
      { unique: true, fields: ['email'] },
      { unique: true, fields: ['emailVerificationToken'] }
    ]
  }
);

AuthModel.addHook('beforeCreate', async (auth: Model) => {
  const hashedPassword = await hash(auth.dataValues.password as string, SALT_Rounds);
  auth.dataValues.password = hashedPassword;
});

// to add comparePassword to the actual model
AuthModel.prototype.comparePassword = async function (password: string, hashedPassword: string): Promise<boolean> {
  return await compare(password, hashedPassword);
};

AuthModel.prototype.hashPassword = async function (password: string) {
  return await hash(password, SALT_Rounds);
};

process.env.NODE_ENV !== 'test' && AuthModel.sync({});

export { AuthModel };
