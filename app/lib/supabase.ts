import { createClient } from '@supabase/supabase-js';

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;

// Create a mock builder that supports chaining and awaiting
const createMockBuilder = () => {
    const builder: any = {
        select: () => builder,
        insert: () => builder,
        update: () => builder,
        delete: () => builder,
        order: () => builder,
        limit: () => builder,
        single: () => builder,
        eq: () => builder,
        // Make the builder "thenable" so it can be awaited
        then: (onfulfilled: any, onrejected: any) =>
            Promise.resolve({ data: [], error: null }).then(onfulfilled, onrejected)
    };
    return builder;
};

// Create a client if keys are present, otherwise return a dummy client
export const supabase = (supabaseUrl && supabaseKey)
    ? createClient(supabaseUrl, supabaseKey)
    : {
        from: () => createMockBuilder(),
        channel: () => ({
            on: () => ({
                subscribe: () => { }
            }),
            unsubscribe: () => { }
        }),
        removeChannel: () => { }
    } as any;
