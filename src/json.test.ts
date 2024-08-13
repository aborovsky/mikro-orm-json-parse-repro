import {Entity, JsonType, MikroORM, Opt, PrimaryKey, Property} from '@mikro-orm/postgresql';

@Entity()
class TestJsonEntity {

    @PrimaryKey()
    id!: number;

    @Property({
        fieldName: 'jsonArray',
        type: JsonType,
        defaultRaw: `'[]'`,
        columnType: 'json'
    })
    public jsonArray: string[] & Opt = [];

    @Property({
        fieldName: 'jsonObj',
        type: JsonType,
        nullable: true,
        columnType: 'json'
    })
    public jsonObj: { foo: number, bar: string } & Opt;

    constructor() {
    }

}

let orm: MikroORM;

beforeAll(async () => {
    orm = await MikroORM.init({
        clientUrl: 'postgresql://postgres:password@localhost:5439/development',
        entities: [TestJsonEntity],
        debug: ['query', 'query-params'],
        allowGlobalContext: true, // only for testing
    });
    await orm.schema.refreshDatabase();
});

afterAll(async () => {
    await orm.close(true);
});

test('test json field parse', async () => {
    orm.em.create(TestJsonEntity, {jsonArray: ['foo', 'bar'], jsonObj: {foo: 2, bar: 'abc'}});
    await orm.em.flush();
    orm.em.clear();

    const testEntityInstances = await orm.em.findAll(TestJsonEntity);
    expect(testEntityInstances).toEqual(
        [{
            "id": 1,
            /**
             * I expect to have parsed array and obj here as it works for jsonb.
             * Like here: https://github.com/aborovsky/mikro-orm-json-parse-repro/blob/master/src/jsonb.test.ts#L55-L56
             * But instead get strings here:
             *             "jsonArray": "[\"foo\",\"bar\"]",
             *             "jsonObj": "{\"foo\":2,\"bar\":\"abc\"}"
             * Is this expected behaviour?
             * Why it differs?
             */
            "jsonArray": ["foo", "bar"],
            "jsonObj": {"bar": "abc", foo: 2}
        }]
    );

    orm.em.remove(testEntityInstances);
    await orm.em.flush();
});
