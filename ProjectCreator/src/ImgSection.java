import javax.swing.*;
import java.awt.event.ActionEvent;
import java.awt.event.ActionListener;

public class ImgSection extends Section{
  public ImgSection(AR it) {
    super(it);
  }

  @Override
  JComponent getContents() {
    return null;
  }

  public JButton getAddButton(AR it) {
    JButton out = new JButton("add text");
    out.addActionListener(new ActionListener() {
      @Override
      public void actionPerformed(ActionEvent e) {
        it.add(new ImgSection(it));
      }
    });
    return out;
  }
}
