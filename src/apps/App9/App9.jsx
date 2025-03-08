import { Layout, Typography, Button, Card, Empty } from 'antd'
import { Link } from 'react-router-dom'
import { HomeOutlined } from '@ant-design/icons'

const { Header, Content } = Layout
const { Title, Paragraph } = Typography

function App9() {
  return (
    <Layout style={{ minHeight: '100vh' }}>
      <Header style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between' }}>
        <Title level={3} style={{ margin: 0, color: 'white' }}>待开发1</Title>
        <Link to="/">
          <Button type="primary" icon={<HomeOutlined />}>
            返回首页
          </Button>
        </Link>
      </Header>
      
      <Content style={{ padding: '24px' }}>
        <Card>
          <Empty 
            description={
              <span>
                <Title level={4}>功能开发中</Title>
                <Paragraph>此应用正在开发中，敬请期待</Paragraph>
              </span>
            }
            image={Empty.PRESENTED_IMAGE_SIMPLE}
          />
        </Card>
      </Content>
    </Layout>
  )
}

export default App9