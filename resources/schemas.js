const Sequelize = require('sequelize')
const yargs = require('yargs/yargs')
const { hideBin } = require('yargs/helpers')

const argv = yargs(hideBin(process.argv)).options({
  user: { type: 'string', alias: 'u', demandOption: true },
  password: { type: 'string', alias: 'p', demandOption: true },
  host: { type: 'string', alias: 'h', demandOption: true },
  port: { type: 'number', alias: 'o', demandOption: true },
  database: { type: 'string', alias: 'd', demandOption: true },
}).argv

const sequelize = new Sequelize(`postgres://${argv.user}:${argv.password}@${argv.host}:${argv.port}/${argv.database}`, {
  define: {
    timestamps: false,
  },
})

const Product = sequelize.define(
  'Product',
  {
    id: {
      type: Sequelize.STRING,
      primaryKey: true,
    },

    ean: Sequelize.STRING(13),
    title: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    url: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    image: {
      type: Sequelize.TEXT,
      allowNull: false,
    },
    price: {
      type: Sequelize.FLOAT,
      allowNull: false,
    },
    rating: {
      type: Sequelize.FLOAT,
      allowNull: false,
    },
    score: {
      type: Sequelize.INTEGER,
      allowNull: false,
    },
    category: {
      type: Sequelize.STRING,
      allowNull: false,
    },
    createdAt: {
      field: 'created_at',
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    modifiedAt: {
      field: 'modified_at',
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    has_quantity_limit: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
    creator: Sequelize.STRING,
    velocity: Sequelize.FLOAT,
  },
  {
    tableName: 'product',
  },
)

const Price = sequelize.define(
  'Price',
  {
    id: {
      type: Sequelize.STRING,
      primaryKey: true,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      references: {
        model: Product,
        key: 'id',
      },
    },
    value: {
      type: Sequelize.FLOAT,
      primaryKey: true,
    },
    createdAt: {
      field: 'created_at',
      type: Sequelize.DATE,
      primaryKey: true,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },

    modifiedAt: {
      field: 'modified_at',
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    weight: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
    notified: {
      type: Sequelize.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    tableName: 'price',
  },
)

const Quantity = sequelize.define(
  'Quantity',
  {
    id: {
      type: Sequelize.STRING,
      primaryKey: true,
      onDelete: 'CASCADE',
      onUpdate: 'CASCADE',
      references: {
        model: Product,
        key: 'id',
      },
    },
    value: {
      type: Sequelize.INTEGER,
      primaryKey: true,
    },
    createdAt: {
      field: 'created_at',
      type: Sequelize.DATE,
      primaryKey: true,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },

    modifiedAt: {
      field: 'modified_at',
      type: Sequelize.DATE,
      allowNull: false,
      defaultValue: Sequelize.literal('CURRENT_TIMESTAMP'),
    },
    weight: {
      type: Sequelize.INTEGER,
      allowNull: false,
      defaultValue: 1,
    },
  },
  {
    tableName: 'quantity',
  },
)

const createTrigger = async (tableName) => {
  await sequelize.query(`
    CREATE TRIGGER update_${tableName}_modified BEFORE UPDATE
    ON ${tableName} FOR EACH ROW EXECUTE PROCEDURE
    update_modified_column();
  `)
}

const main = async () => {
  await sequelize.sync()

  // add auto-update `modified_at` trigger
  await sequelize.query(`
    CREATE OR REPLACE FUNCTION update_modified_column()
    RETURNS TRIGGER AS $$
    BEGIN
      NEW.modified_at = now();
      RETURN NEW;
    END;
    $$ language 'plpgsql';
  `)

  await createTrigger('product')
  await createTrigger('price')
  await createTrigger('quantity')
}

main().catch((error) => console.error(`Failed to execute script: ${error}`))
