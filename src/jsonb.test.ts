import {Entity, JsonType, MikroORM, Opt, PrimaryKey, Property} from '@mikro-orm/postgresql';

@Entity()
class TestJsonBEntity {

    @PrimaryKey()
    id!: number;

    @Property({
        fieldName: 'jsonArray',
        type: JsonType,
        defaultRaw: `'[]'`,
        columnType: 'jsonb'
    })
    public jsonArray: string[] & Opt = [];

    @Property({
        fieldName: 'jsonObj',
        type: JsonType,
        nullable: true,
        columnType: 'jsonb'
    })
    public jsonObj: { foo: number, bar: string } & Opt;

    constructor() {
    }

}

let orm: MikroORM;

beforeAll(async () => {
    orm = await MikroORM.init({
        clientUrl: 'postgresql://postgres:password@localhost:5439/development',
        entities: [TestJsonBEntity],
        debug: ['query', 'query-params'],
        allowGlobalContext: true, // only for testing
    });
    await orm.schema.refreshDatabase();
});

afterAll(async () => {
    await orm.close(true);
});

test('test jsonb field parse', async () => {
    orm.em.create(TestJsonBEntity, {jsonArray: ['foo', 'bar'], jsonObj: {foo: 2, bar: 'abc'}});
    await orm.em.flush();
    orm.em.clear();

    const testEntityInstances = await orm.em.findAll(TestJsonBEntity);
    expect(testEntityInstances).toEqual(
        [{
            "id": 1,
            "jsonArray": ["foo", "bar"],
            "jsonObj": {"bar": "abc", foo: 2}
        }]
    );

    orm.em.remove(testEntityInstances);
    await orm.em.flush();
});
