import { Injectable, NotFoundException } from '@nestjs/common';
import { CreatePostDto } from './dto/create-post.dto';
import { UpdatePostDto } from './dto/update-post.dto';
import { Post } from './entities/post.entity';

@Injectable()
export class PostsService {
  private posts: Post[] = [];
  private nextId: number = 1;

  create(post: CreatePostDto): Post {
    const newPost: Post = {
      ...post,
      id: this.nextId++,
      publishDate: new Date(),
      likes: 0,
      dislikes: 0,
    };

    this.posts.push(newPost);
    return newPost;
  }

  findAll(): Post[] {
    if(this.posts.length === 0)
      throw new NotFoundException(`Error! There are no posts`)

    return this.posts
  }

  findOne(id: number): Post {
    return this.findPostById(id);
  }

  update(id: number, dto: UpdatePostDto): Post {
    const post = this.findPostById(id);
    const { title } = dto;

    Object.assign(post, { title });

    return post;
  }

  remove(id: number): void {
    this.findPostById(id);
    this.posts = this.posts.filter((post) => post.id !== id);
  }

  like(id: number): Post {
    const post = this.findPostById(id);
    post.likes += 1;
    return post;
  }

  dislike(id: number): Post {
    const post = this.findPostById(id);
    post.dislikes += 1;
    return post;
  }


  private findPostById(id: number) {
    const post = this.posts.find(post => post.id === id);
    
    if (!post) throw new NotFoundException(`Error! There is no post with id: ${id}`);

    return post;
  }
}
