import { createServer, createPubSub } from "@graphql-yoga/node";

const TODOS_CHANNEL = 'TODOS_CHANNEL';

const pubSub = createPubSub();

let todos = [
  {
    id: "1",
    text: "Learn GraphQL + Solid",
    done: false,
  }
];



const server = createServer({
  context: { pubSub },
  schema: {
    typeDefs: `
    type Todo {
      id: ID!
      done: Boolean!
      text: String!
    }
    type Query {
      getTodos: [Todo]!
    }
    type Mutation {
      addTodo(text: String!): Todo
      setDone(id: ID!, done: Boolean!): Todo
    }
    type Subscription {
      todos: [Todo]!
    }
  `,
    resolvers: {
      Query: {
        getTodos: () => {
          return todos;
        }
      },
      Mutation: {
        addTodo: (_: unknown, { text }: { text: string }, { pubSub }: any) => {
          const newTodo = {
            id: String(todos.length + 1),
            text,
            done: false,
          }
          todos.push(newTodo);
          pubSub.publish(TODOS_CHANNEL, { todos });
          return newTodo;
        },
        setDone: (_: unknown, { id, done }: { id: string; done: boolean }, { pubSub }: any) => {
          const todo = todos.find((todo) => todo.id === id);
          if (!todo) {
            throw new Error("Todo not found");
          }
          todo.done = done;
          pubSub.publish(TODOS_CHANNEL, { todos });
          return todo;
        }
      },
      Subscription: {
        todos: {
          subscribe: (_:any, args: any, context: any) => context.subscribe(TODOS_CHANNEL),
        }
      }
    },
  },
});

server.start()
